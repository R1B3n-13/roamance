package com.devs.roamance.controller;

import com.devs.roamance.dto.request.ai.MultiModalRagRequestDto;
import com.devs.roamance.dto.request.ai.UniModalAiRequestDto;
import com.devs.roamance.dto.response.social.PostListResponseDto;
import com.devs.roamance.service.AiService;
import com.devs.roamance.service.PostService;
import com.devs.roamance.util.PaginationSortingUtil;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.async.DeferredResult;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Slf4j
@RestController
@RequestMapping("/ai")
public class AiController {

  private final AiService aiService;
  private final PostService postService;

  public AiController(AiService aiService, PostService postService) {
    this.aiService = aiService;
    this.postService = postService;
  }

  @PostMapping(value = "/proof-read", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public Flux<String> generateProofreading(@Valid @RequestBody UniModalAiRequestDto requestDto) {

    Sinks.Many<String> sink = Sinks.many().multicast().onBackpressureBuffer();

    aiService.getProofreading(requestDto, sink);

    return sink.asFlux()
        .doOnError(err -> log.error("Streaming failed with error :{}", err.getMessage(), err))
        .doOnCancel(
            () -> {
              log.debug("Client cancelled the proofreading stream");
              sink.tryEmitComplete();
            });
  }

  @PostMapping("/rag-search")
  public DeferredResult<ResponseEntity<PostListResponseDto>> ragSearchPosts(
      @Valid @RequestBody MultiModalRagRequestDto requestDto,
      @RequestParam(defaultValue = "0") int pageNumber,
      @RequestParam(defaultValue = "10") int pageSize) {

    DeferredResult<ResponseEntity<PostListResponseDto>> deferredResult = new DeferredResult<>();

    aiService
        .getPostIdsUsingRag(requestDto)
        .whenComplete(
            (postIdsDto, ex) -> {
              if (ex != null) {
                deferredResult.setErrorResult(ex);
              } else {
                int[] params = PaginationSortingUtil.validatePaginationParams(pageNumber, pageSize);

                PostListResponseDto dto =
                    postService.getByIds(postIdsDto.getPostIds(), params[0], params[1]);

                deferredResult.setResult(ResponseEntity.ok(dto));
              }
            });

    return deferredResult;
  }
}
