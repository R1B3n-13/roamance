package com.devs.roamance.dto.request.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MultiModalAiRequestDto {

  @Size(max = 10_000, message = "Text must not exceed 10000 characters")
  private String text;

  @Size(max = 55, message = "At most 55 media urls are supported")
  @JsonProperty("media_urls")
  private List<String> mediaUrls = new ArrayList<>();
}
