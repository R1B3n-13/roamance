package com.devs.roamance.service.impl;

import static dev.langchain4j.model.googleai.GeminiHarmBlockThreshold.BLOCK_LOW_AND_ABOVE;
import static dev.langchain4j.model.googleai.GeminiHarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE;
import static dev.langchain4j.model.googleai.GeminiHarmCategory.*;

import com.devs.roamance.constant.AiSystemInstruction;
import com.devs.roamance.constant.ResponseMessage;
import com.devs.roamance.dto.request.ai.MultiModalAiRequestDto;
import com.devs.roamance.dto.request.ai.MultiModalRagRequestDto;
import com.devs.roamance.dto.request.ai.UniModalAiRequestDto;
import com.devs.roamance.dto.response.ai.EmbeddingResponse;
import com.devs.roamance.dto.response.ai.PostIdListRagSearchDto;
import com.devs.roamance.dto.response.ai.TidbitsAndSafetyDto;
import com.devs.roamance.exception.AiGenerationFailedException;
import com.devs.roamance.service.AiService;
import com.devs.roamance.util.GeminiModelUtil;
import com.devs.roamance.util.NomicImageEmbeddingUtil;
import com.devs.roamance.util.RagUtil;
import com.devs.roamance.util.RestUtil;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.message.*;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.chat.StreamingChatLanguageModel;
import dev.langchain4j.model.chat.request.ResponseFormat;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.chat.response.StreamingChatResponseHandler;
import dev.langchain4j.model.output.FinishReason;
import dev.langchain4j.rag.RetrievalAugmentor;
import dev.langchain4j.service.AiServices;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Sinks;

@Service
@Slf4j
public class AiServiceImpl implements AiService {

  @Value("${application.gemini.api-key}")
  private String geminiApiKey;

  @Value("${application.nomic.api-key}")
  private String nomicApiKey;

  private String geminiModelName = "gemini-2.0-flash";

  private final RestUtil restUtil;
  private final GeminiModelUtil geminiModelUtil;
  private final RagUtil ragUtil;
  private final NomicImageEmbeddingUtil nomicImageEmbeddingUtil;

  public AiServiceImpl(
      RestUtil restUtil,
      GeminiModelUtil geminiModelUtil,
      RagUtil ragUtil,
      NomicImageEmbeddingUtil nomicImageEmbeddingUtil) {

    this.restUtil = restUtil;
    this.geminiModelUtil = geminiModelUtil;
    this.ragUtil = ragUtil;
    this.nomicImageEmbeddingUtil = nomicImageEmbeddingUtil;
  }

  private interface RagAssistant {

    @dev.langchain4j.service.SystemMessage(AiSystemInstruction.FOR_POST_IDS_RETRIEVAL)
    PostIdListRagSearchDto answer(String question);
  }

  @Override
  @Async("asyncExecutor")
  public CompletableFuture<TidbitsAndSafetyDto> getTidbitsAndSafety(
      MultiModalAiRequestDto requestDto) {

    Map<String, RestUtil.Media> mediaBytes = downloadMedia(requestDto.getMediaUrls());

    ChatLanguageModel model;
    try {
      model =
          geminiModelUtil.geminiModelBuilder(
              geminiApiKey,
              geminiModelName,
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
      log.error("Gemini model build failed : {}", e.getMessage(), e);
      return CompletableFuture.completedFuture(new TidbitsAndSafetyDto(null, FinishReason.OTHER));
    }

    ChatResponse chatResponse =
        generateResponse(model, AiSystemInstruction.FOR_TIDBITS, mediaBytes, requestDto.getText());

    if (chatResponse == null) {

      return CompletableFuture.completedFuture(new TidbitsAndSafetyDto(null, FinishReason.OTHER));
    }

    return CompletableFuture.completedFuture(
        new TidbitsAndSafetyDto(chatResponse.aiMessage().text(), chatResponse.finishReason()));
  }

  @Override
  @Async("asyncExecutor")
  public void getProofreading(UniModalAiRequestDto requestDto, Sinks.Many<String> sink) {

    StreamingChatLanguageModel model;
    try {
      model =
          geminiModelUtil.geminiStreamingModelBuilder(
              geminiApiKey, geminiModelName, builder -> builder.temperature(0.5));

    } catch (Exception e) {
      log.error("Gemini model build failed:{}", e.getMessage(), e);

      sink.emitError(
          new AiGenerationFailedException(ResponseMessage.AI_MODEL_BUILD_FAILED),
          Sinks.EmitFailureHandler.FAIL_FAST);

      return;
    }

    generateStreamingResponse(
        model, AiSystemInstruction.FOR_PROOFREADING, null, requestDto.getText(), sink);
  }

  @Override
  @Async("asyncExecutor")
  public CompletableFuture<Void> addContentToVectorDb(
      MultiModalAiRequestDto requestDto, UUID contentId) {

    try {
      ragUtil.embedAndStore(
          nomicApiKey,
          Document.from(requestDto.getText()),
          contentId.toString(),
          "search_document",
          "texts");

    } catch (Exception e) {
      log.error("Text embeddings generation failed: {}", e.getMessage(), e);
    }

    Map<String, RestUtil.Media> mediaBytes = downloadMedia(requestDto.getMediaUrls());

    ChatLanguageModel model;
    try {
      model =
          geminiModelUtil.geminiModelBuilder(
              geminiApiKey, geminiModelName, builder -> builder.temperature(0.1));

    } catch (Exception e) {
      log.error("Gemini model build failed: {}", e.getMessage(), e);

      return CompletableFuture.failedFuture(
          new AiGenerationFailedException(ResponseMessage.AI_MODEL_BUILD_FAILED));
    }

    try {
      List<EmbeddingResponse> imageEmbeddings =
          nomicImageEmbeddingUtil.embedImageUrls(nomicApiKey, requestDto.getMediaUrls());

      ragUtil.store(imageEmbeddings, 768, contentId.toString(), "image_embeddings");

    } catch (InterruptedException e) {
      log.error("Image embeddings generation interrupted: {}", e.getMessage(), e);
      Thread.currentThread().interrupt();

    } catch (Exception e) {
      log.error("Image embeddings generation failed: {}", e.getMessage(), e);
    }

    ChatResponse chatResponse =
        generateResponse(model, AiSystemInstruction.FOR_IMAGE_DESCRIPTION, mediaBytes, null);

    if (chatResponse == null) {
      return CompletableFuture.completedFuture(null);
    }

    try {
      ragUtil.embedAndStore(
          nomicApiKey,
          Document.from(chatResponse.aiMessage().text()),
          contentId.toString(),
          "search_document",
          "image_descriptions");

    } catch (Exception e) {
      log.error("Text embeddings generation failed: {}", e.getMessage(), e);
    }

    return CompletableFuture.completedFuture(null);
  }

  @Override
  @Async("asyncExecutor")
  public CompletableFuture<PostIdListRagSearchDto> getPostIdsUsingRag(
      MultiModalRagRequestDto requestDto) {

    ChatLanguageModel model;
    try {
      model =
          geminiModelUtil.geminiModelBuilder(
              geminiApiKey, geminiModelName, builder -> builder.temperature(0.1));

    } catch (Exception e) {
      log.error("Gemini model build failed: {}", e.getMessage(), e);

      return CompletableFuture.failedFuture(
          new AiGenerationFailedException(ResponseMessage.AI_MODEL_BUILD_FAILED));
    }

    Map<String, RestUtil.Media> mediaBytes = null;
    if (requestDto.getImageUrl() != null && !requestDto.getImageUrl().isEmpty()) {
      mediaBytes = downloadMedia(List.of(requestDto.getImageUrl()));
    }

    ChatResponse chatResponse =
        generateResponse(model, AiSystemInstruction.FOR_IMAGE_DESCRIPTION, mediaBytes, null);

    String query;
    if (chatResponse != null && requestDto.getQuery() != null && !requestDto.getQuery().isEmpty()) {

      query =
          "Query: "
              + requestDto.getQuery()
              + "Query Image Description: "
              + chatResponse.aiMessage().text();

    } else if (requestDto.getQuery() != null && !requestDto.getQuery().isEmpty()) {
      query = "Query: " + requestDto.getQuery();
    } else {
      log.info("Query is null or empty");
      return CompletableFuture.completedFuture(new PostIdListRagSearchDto());
    }

    RetrievalAugmentor augmentor =
        ragUtil.buildAugmentor(nomicApiKey, "search_query", "texts", "image_descriptions");

    try {
      model =
          geminiModelUtil.geminiModelBuilder(
              geminiApiKey,
              geminiModelName,
              builder -> builder.temperature(0.8).responseFormat(ResponseFormat.JSON));

    } catch (Exception e) {
      log.error("Gemini model build failed : {}", e.getMessage(), e);

      return CompletableFuture.failedFuture(
          new AiGenerationFailedException(ResponseMessage.AI_MODEL_BUILD_FAILED));
    }

    RagAssistant ragAssistant =
        AiServices.builder(RagAssistant.class)
            .chatLanguageModel(model)
            .retrievalAugmentor(augmentor)
            .build();

    PostIdListRagSearchDto postIdListRagSearchDto = ragAssistant.answer(query);

    return CompletableFuture.completedFuture(postIdListRagSearchDto);
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

  private Map<String, RestUtil.Media> downloadMedia(List<String> mediaUrls) {

    Map<String, RestUtil.Media> mediaBytes = new HashMap<>();

    try {
      mediaBytes = restUtil.downloadMultipleMediaWithMime(mediaUrls).get(10, TimeUnit.SECONDS);

      return mediaBytes;

    } catch (InterruptedException e) {
      log.error("Media download interrupted: {}", e.getMessage(), e);
      Thread.currentThread().interrupt();

      return Collections.emptyMap();

    } catch (Exception e) {
      log.error("Media download failed: {}", e.getMessage(), e);

      return Collections.emptyMap();
    }
  }
}
