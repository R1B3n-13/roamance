package com.devs.roamance.util;

import com.devs.roamance.constant.ResponseMessage;
import com.devs.roamance.dto.request.ai.MultiModalAiRequestDto;
import com.devs.roamance.dto.request.social.PostRequestDto;
import com.devs.roamance.dto.response.ai.TidbitsAndSafetyResponseDto;
import com.devs.roamance.exception.ResourceNotFoundException;
import com.devs.roamance.model.social.Post;
import com.devs.roamance.repository.PostRepository;
import com.devs.roamance.service.AiService;
import dev.langchain4j.model.output.FinishReason;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class PostUtil {

  private final AiService aiService;
  private final PostRepository postRepository;

  public PostUtil(AiService aiService, PostRepository postRepository) {
    this.aiService = aiService;
    this.postRepository = postRepository;
  }

  @Async("asyncExecutor")
  public void backgroundAiAnalysis(UUID postId, PostRequestDto createRequestDto) {
    try {
      MultiModalAiRequestDto aiRequestDto = new MultiModalAiRequestDto();
      setFields(aiRequestDto, createRequestDto);

      TidbitsAndSafetyResponseDto responseDto = aiService.getTidbitsAndSafety(aiRequestDto).join();

      Post post =
          postRepository
              .findById(postId)
              .orElseThrow(
                  () ->
                      new ResourceNotFoundException(
                          String.format(ResponseMessage.POST_NOT_FOUND, postId)));

      updatePostWithAnalysis(responseDto, post);

      postRepository.save(post);

    } catch (Exception e) {
      log.error("Error in background AI analysis for post {}: {}", postId, e.getMessage(), e);
    }
  }

  public void addToVectorDb(UUID postId, PostRequestDto requestDto) {

    requestDto.setVideoPaths(null);

    MultiModalAiRequestDto aiRequestDto = new MultiModalAiRequestDto();
    setFields(aiRequestDto, requestDto);

    aiService.addContentToVectorDb(aiRequestDto, postId);
  }

  private void setFields(MultiModalAiRequestDto aiRequestDto, PostRequestDto createRequestDto) {

    if (createRequestDto.getText() != null && !createRequestDto.getText().isEmpty()) {
      aiRequestDto.setText(createRequestDto.getText());
    }
    if (createRequestDto.getImagePaths() != null && !createRequestDto.getImagePaths().isEmpty()) {
      aiRequestDto.setMediaUrls(createRequestDto.getImagePaths());
    }
    if (createRequestDto.getVideoPaths() != null && !createRequestDto.getVideoPaths().isEmpty()) {
      aiRequestDto.getMediaUrls().addAll(createRequestDto.getVideoPaths());
    }
  }

  private void updatePostWithAnalysis(TidbitsAndSafetyResponseDto responseDto, Post post) {

    if (responseDto.getFinishReason() == FinishReason.CONTENT_FILTER) {
      post.setIsSafe(false);
    } else if (responseDto.getText() != null && !responseDto.getText().isEmpty()) {
      post.setTidbits(responseDto.getText());
    }
  }
}
