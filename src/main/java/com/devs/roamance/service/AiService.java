package com.devs.roamance.service;

import com.devs.roamance.dto.request.ai.MultiModalAiRequestDto;
import com.devs.roamance.dto.request.ai.UniModalAiRequestDto;
import com.devs.roamance.dto.response.ai.TidbitsAndSafetyResponseDto;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import org.springframework.scheduling.annotation.Async;
import reactor.core.publisher.Sinks;

public interface AiService {

  @Async("asyncExecutor")
  CompletableFuture<TidbitsAndSafetyResponseDto> getTidbitsAndSafety(
      MultiModalAiRequestDto requestDto);

  @Async("asyncExecutor")
  void getProofreading(UniModalAiRequestDto requestDto, Sinks.Many<String> sink);

  @Async("asyncExecutor")
  CompletableFuture<Void> addContentToVectorDb(MultiModalAiRequestDto requestDto, UUID contentId);
}
