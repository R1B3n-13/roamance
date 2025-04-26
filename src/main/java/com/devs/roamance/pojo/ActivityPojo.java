package com.devs.roamance.pojo;

import com.devs.roamance.model.travel.Location;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalTime;
import lombok.Data;

@Data
public class ActivityPojo {

  @JsonProperty(required = true)
  private Location location;

  @JsonProperty(required = true)
  private LocalTime startTime;

  @JsonProperty(required = true)
  private LocalTime endTime;

  @JsonProperty(required = true)
  private String type;

  @JsonProperty(required = true)
  private String note;

  @JsonProperty(required = true)
  private BigDecimal cost;
}
