package com.devs.roamance.service;

import com.devs.roamance.dto.request.ai.AiPoweredItineraryCreateRequestDto;
import com.devs.roamance.dto.request.ai.MultiModalAiRequestDto;
import com.devs.roamance.dto.request.ai.MultiModalRagRequestDto;
import com.devs.roamance.dto.request.ai.UniModalAiRequestDto;
import com.devs.roamance.dto.response.ai.AiPoweredItineraryResponseDto;
import com.devs.roamance.dto.response.ai.PostIdListRagSearchDto;
import com.devs.roamance.dto.response.ai.TidbitsAndSafetyDto;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import org.springframework.scheduling.annotation.Async;
import reactor.core.publisher.Sinks;

public interface AiService {

  @Async("asyncExecutor")
  CompletableFuture<TidbitsAndSafetyDto> getTidbitsAndSafety(MultiModalAiRequestDto requestDto);

  @Async("asyncExecutor")
  void getProofreading(UniModalAiRequestDto requestDto, Sinks.Many<String> sink);

  @Async("asyncExecutor")
  CompletableFuture<Void> addContentToVectorDb(MultiModalAiRequestDto requestDto, UUID contentId);

  @Async("asyncExecutor")
  CompletableFuture<PostIdListRagSearchDto> getPostIdsUsingRag(MultiModalRagRequestDto requestDto);

  @Async("asyncExecutor")
  CompletableFuture<AiPoweredItineraryResponseDto> getAiPoweredItinerary(
      AiPoweredItineraryCreateRequestDto requestDto);
}
