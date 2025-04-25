package com.devs.roamance.controller;

import com.devs.roamance.dto.request.ai.UniModalAiRequestDto;
import com.devs.roamance.service.AiService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Slf4j
@RestController
@RequestMapping("/ai")
public class AiController {

  private final AiService aiService;

  public AiController(AiService aiService) {
    this.aiService = aiService;
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
}
