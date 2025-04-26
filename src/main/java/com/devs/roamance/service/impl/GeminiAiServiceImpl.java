package com.devs.roamance.service.impl;

import static dev.langchain4j.model.googleai.GeminiHarmBlockThreshold.BLOCK_LOW_AND_ABOVE;
import static dev.langchain4j.model.googleai.GeminiHarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE;
import static dev.langchain4j.model.googleai.GeminiHarmCategory.*;

import com.devs.roamance.constant.AiSystemInstruction;
import com.devs.roamance.constant.ResponseMessage;
import com.devs.roamance.dto.request.ai.MultiModalAiRequestDto;
import com.devs.roamance.dto.request.ai.UniModalAiRequestDto;
import com.devs.roamance.dto.response.ai.TidbitsAndSafetyResponseDto;
import com.devs.roamance.exception.AiGenerationFailedException;
import com.devs.roamance.service.GeminiAiService;
import com.devs.roamance.util.GeminiAiUtil;
import com.devs.roamance.util.RestUtil;
import dev.langchain4j.data.message.*;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.chat.StreamingChatLanguageModel;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.chat.response.StreamingChatResponseHandler;
import dev.langchain4j.model.output.FinishReason;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Sinks;

@Service
@Slf4j
public class GeminiAiServiceImpl implements GeminiAiService {

  @Value("${application.gemini.api-key}")
  private String apiKey;

  private final RestUtil restUtil;
  private final GeminiAiUtil geminiAiUtil;

  public GeminiAiServiceImpl(RestUtil restUtil, GeminiAiUtil geminiAiUtil) {

    this.restUtil = restUtil;
    this.geminiAiUtil = geminiAiUtil;
  }

  @Override
  @Async("asyncExecutor")
  public CompletableFuture<TidbitsAndSafetyResponseDto> getTidbitsAndSafety(
      MultiModalAiRequestDto requestDto) {

    Map<String, RestUtil.Media> mediaBytes = new HashMap<>();

    try {
      mediaBytes =
          restUtil
              .downloadMultipleMediaWithMime(requestDto.getMediaUrls())
              .get(10, TimeUnit.SECONDS);

    } catch (InterruptedException e) {
      log.error("Media download interrupted: {}", e.getMessage(), e);
      Thread.currentThread().interrupt();

    } catch (Exception e) {
      log.error("Media download failed: {}", e.getMessage(), e);
    }

    ChatLanguageModel model;

    try {
      model =
          geminiAiUtil.geminiModelBuilder(
              apiKey,
              "gemini-2.0-flash",
              builder ->
                  builder
                      .safetySettings(
                          Map.of(
                              HARM_CATEGORY_HARASSMENT, BLOCK_LOW_AND_ABOVE,
                              HARM_CATEGORY_DANGEROUS_CONTENT, BLOCK_MEDIUM_AND_ABOVE,
                              HARM_CATEGORY_SEXUALLY_EXPLICIT, BLOCK_LOW_AND_ABOVE,
                              HARM_CATEGORY_HATE_SPEECH, BLOCK_LOW_AND_ABOVE,
                              HARM_CATEGORY_CIVIC_INTEGRITY, BLOCK_MEDIUM_AND_ABOVE))
                      .temperature(0.3));
    } catch (Exception e) {
      log.error("Gemini model build failed: {}", e.getMessage(), e);
      return CompletableFuture.completedFuture(
          new TidbitsAndSafetyResponseDto(null, FinishReason.OTHER));
    }

    ChatResponse chatResponse =
        generateResponse(model, AiSystemInstruction.FOR_TIDBITS, mediaBytes, requestDto.getText());

    if (chatResponse == null) {

      return CompletableFuture.completedFuture(
          new TidbitsAndSafetyResponseDto(null, FinishReason.OTHER));
    }

    return CompletableFuture.completedFuture(
        new TidbitsAndSafetyResponseDto(
            chatResponse.aiMessage().text(), chatResponse.finishReason()));
  }

  @Override
  @Async("asyncExecutor")
  public void getProofreading(UniModalAiRequestDto requestDto, Sinks.Many<String> sink) {

    StreamingChatLanguageModel model;

    try {
      model =
          geminiAiUtil.geminiStreamingModelBuilder(
              apiKey, "gemini-2.0-flash", builder -> builder.temperature(0.5));

    } catch (Exception e) {
      log.error("Gemini model build failed: {}", e.getMessage(), e);

      sink.emitError(
          new AiGenerationFailedException(ResponseMessage.GEMINI_MODEL_BUILD_FAILED),
          Sinks.EmitFailureHandler.FAIL_FAST);

      return;
    }

    generateStreamingResponse(
        model, AiSystemInstruction.FOR_PROOFREADING, null, requestDto.getText(), sink);
  }

  private ChatResponse generateResponse(
      ChatLanguageModel model,
      String systemInstruction,
      Map<String, RestUtil.Media> mediaBytes,
      String text) {

    if ((text == null || text.isEmpty()) && (mediaBytes == null || mediaBytes.isEmpty())) {
      return null;
    }

    try {
      SystemMessage systemMessage = new SystemMessage(systemInstruction);

      UserMessage.Builder userMessageBuilder = UserMessage.builder();
      addContentToUserMessage(userMessageBuilder, mediaBytes, text);
      UserMessage userMessage = userMessageBuilder.build();

      return model.chat(systemMessage, userMessage);

    } catch (NullPointerException e) {
      /* This is quite hacky. But due to a bug in langchain4j, currently this is the only solution that I came up with
       * I have opened an issue in langchain4j's GitHub repo
       * See here: https://github.com/langchain4j/langchain4j/issues/2893
       */
      log.error("AI response generation failed: {}", e.getMessage(), e);
      return ChatResponse.builder()
          .aiMessage(new AiMessage(""))
          .finishReason(FinishReason.CONTENT_FILTER)
          .build();
    } catch (Exception e) {
      log.error("AI response generation failed: {}", e.getMessage(), e);
      return null;
    }
  }

  private void generateStreamingResponse(
      StreamingChatLanguageModel model,
      String systemInstruction,
      Map<String, RestUtil.Media> mediaBytes,
      String text,
      Sinks.Many<String> sink) {

    if ((text == null || text.isEmpty()) && (mediaBytes == null || mediaBytes.isEmpty())) {

      sink.emitError(
          new AiGenerationFailedException(ResponseMessage.PROOFREAD_INPUT_NULL),
          Sinks.EmitFailureHandler.FAIL_FAST);

      return;
    }

    try {
      SystemMessage systemMessage = new SystemMessage(systemInstruction);

      UserMessage.Builder userMessageBuilder = UserMessage.builder();
      addContentToUserMessage(userMessageBuilder, mediaBytes, text);
      UserMessage userMessage = userMessageBuilder.build();

      List<ChatMessage> chatMessages = List.of(systemMessage, userMessage);

      model.chat(
          chatMessages,
          new StreamingChatResponseHandler() {

            @Override
            public void onPartialResponse(String partialResponse) {

              sink.emitNext(partialResponse, Sinks.EmitFailureHandler.FAIL_FAST);
            }

            @Override
            public void onCompleteResponse(ChatResponse completeResponse) {
              sink.emitComplete(Sinks.EmitFailureHandler.FAIL_FAST);
            }

            @Override
            public void onError(Throwable error) {

              sink.emitError(
                  new AiGenerationFailedException(ResponseMessage.PROOFREAD_GENERATION_FAILED),
                  Sinks.EmitFailureHandler.FAIL_FAST);
            }
          });

    } catch (Exception e) {
      log.error("AI streaming response generation failed: {}", e.getMessage(), e);

      sink.emitError(
          new AiGenerationFailedException(ResponseMessage.PROOFREAD_GENERATION_FAILED),
          Sinks.EmitFailureHandler.FAIL_FAST);
    }
  }

  private void addContentToUserMessage(
      UserMessage.Builder userMessageBuilder, Map<String, RestUtil.Media> mediaBytes, String text) {

    if (text != null && !text.isEmpty()) {
      userMessageBuilder.addContent(TextContent.from(text));
    }

    if (mediaBytes == null || mediaBytes.isEmpty()) {
      return;
    }

    for (Map.Entry<String, RestUtil.Media> entry : mediaBytes.entrySet()) {
      String base64Image = Base64.getEncoder().encodeToString(entry.getValue().content());
      ImageContent imageContent = ImageContent.from(base64Image, entry.getValue().mimeType());
      userMessageBuilder.addContent(imageContent);
    }
  }
}
