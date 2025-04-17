package com.devs.roamance.dto.request.ai;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MultiModalAiRequestDto {

  private String text;
  private String mediaUrl;
}
