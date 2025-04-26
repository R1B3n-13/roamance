package com.devs.roamance.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;
import dev.langchain4j.model.output.structured.Description;
import lombok.Data;

@Data
@Description("A location.")
public class LocationPojo {

  @Description("Latitude coordinate of the location")
  @JsonProperty(required = true)
  private Double latitude;

  @Description("Longitude coordinate of the location")
  @JsonProperty(required = true)
  private Double longitude;
}
