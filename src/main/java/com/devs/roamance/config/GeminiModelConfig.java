package com.devs.roamance.config;

import static dev.langchain4j.model.googleai.GeminiHarmBlockThreshold.BLOCK_ONLY_HIGH;
import static dev.langchain4j.model.googleai.GeminiHarmCategory.*;

import dev.langchain4j.model.chat.request.ResponseFormat;
import dev.langchain4j.model.googleai.GeminiHarmBlockThreshold;
import dev.langchain4j.model.googleai.GeminiHarmCategory;
import dev.langchain4j.model.googleai.GeminiSafetySetting;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GeminiModelConfig {

  // Default values
  @Builder.Default private double temperature = 1.0;
  @Builder.Default private double topP = 0.8;
  @Builder.Default private int topK = 64;
  @Builder.Default private int maxOutputTokens = 8192;
  @Builder.Default private Duration timeout = Duration.ofSeconds(60);
  @Builder.Default private ResponseFormat responseFormat = ResponseFormat.TEXT;

  @Builder.Default
  private Map<GeminiHarmCategory, GeminiHarmBlockThreshold> safetySettings =
      Map.of(
          HARM_CATEGORY_HARASSMENT, BLOCK_ONLY_HIGH,
          HARM_CATEGORY_DANGEROUS_CONTENT, BLOCK_ONLY_HIGH,
          HARM_CATEGORY_SEXUALLY_EXPLICIT, BLOCK_ONLY_HIGH,
          HARM_CATEGORY_HATE_SPEECH, BLOCK_ONLY_HIGH,
          HARM_CATEGORY_CIVIC_INTEGRITY, BLOCK_ONLY_HIGH);

  public List<GeminiSafetySetting> getSafetySettingsList() {
    return safetySettings.entrySet().stream()
        .map(entry -> new GeminiSafetySetting(entry.getKey(), entry.getValue()))
        .toList();
  }
}
