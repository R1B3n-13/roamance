package com.devs.roamance.dto.request.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MultiModalRagRequestDto {

  @Size(max = 10_000, message = "Query must not exceed 10000 characters")
  private String query;

  @JsonProperty("image_url")
  private String imageUrl;
}
