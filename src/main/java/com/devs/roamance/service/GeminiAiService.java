package com.devs.roamance.service;

import com.devs.roamance.dto.request.ai.MultiModalAiRequestDto;
import com.devs.roamance.dto.request.ai.UniModalAiRequestDto;
import com.devs.roamance.dto.response.ai.AiResponseDto;
import com.devs.roamance.dto.response.ai.TidbitsAndSafetyResponseDto;
import java.util.concurrent.CompletableFuture;
import org.springframework.scheduling.annotation.Async;

public interface GeminiAiService {

  @Async
  CompletableFuture<TidbitsAndSafetyResponseDto> getTidbitsAndSafety(
      MultiModalAiRequestDto requestDto);

  @Async
  CompletableFuture<AiResponseDto> getProofreading(UniModalAiRequestDto requestDto);
}
