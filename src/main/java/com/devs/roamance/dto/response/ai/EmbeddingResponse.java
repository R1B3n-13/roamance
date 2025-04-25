package com.devs.roamance.dto.response.ai;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class EmbeddingResponse {

  private final float[] embedding;
}
