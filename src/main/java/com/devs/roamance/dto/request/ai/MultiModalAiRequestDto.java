package com.devs.roamance.dto.request.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
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

  private String text;

  @JsonProperty("media_urls")
  private List<String> mediaUrls = new ArrayList<>();
}
