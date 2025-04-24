package com.devs.roamance.controller;

import com.devs.roamance.dto.request.ai.UniModalAiRequestDto;
import com.devs.roamance.service.GeminiAiService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Slf4j
@RestController
@RequestMapping("/ai")
public class GeminiAiController {

  private final GeminiAiService geminiAiService;

  public GeminiAiController(GeminiAiService geminiAiService) {
    this.geminiAiService = geminiAiService;
  }

  @PostMapping("/proof-read")
  public Flux<String> generateProofreading(@Valid @RequestBody UniModalAiRequestDto requestDto) {

    Sinks.Many<String> sink = Sinks.many().multicast().onBackpressureBuffer();

    geminiAiService.getProofreading(requestDto, sink);

    return sink.asFlux()
        .onErrorResume(
            err -> {
              log.error("Streaming failed with error :{}", err.getMessage(), err);
              return Flux.error(err);
            });
  }
}
