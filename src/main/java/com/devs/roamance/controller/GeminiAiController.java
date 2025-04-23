package com.devs.roamance.controller;

import com.devs.roamance.dto.request.ai.UniModalAiRequestDto;
import com.devs.roamance.dto.response.ai.AiResponseDto;
import com.devs.roamance.service.GeminiAiService;
import jakarta.validation.Valid;
import java.util.concurrent.CompletableFuture;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ai")
public class GeminiAiController {

  private final GeminiAiService geminiAiService;

  public GeminiAiController(GeminiAiService geminiAiService) {
    this.geminiAiService = geminiAiService;
  }

  @PostMapping("/proof-read")
  public ResponseEntity<AiResponseDto> generateProofreading(
      @Valid @RequestBody UniModalAiRequestDto requestDto) {

    CompletableFuture<AiResponseDto> completableFuture =
        geminiAiService.getProofreading(requestDto);

    AiResponseDto responseDto = completableFuture.join();

    return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
  }
}
