package com.devs.roamance.dto.request.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UniModalAiRequestDto {

  @NotBlank(message = "Text is required")
  @Size(max = 10_000, message = "Text must not exceed 10000 characters")
  private String text;
}
