package com.devs.roamance.dto.response.ai;

import dev.langchain4j.model.output.FinishReason;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TidbitsAndSafetyResponseDto {

  private String text;
  private FinishReason finishReason;
}
