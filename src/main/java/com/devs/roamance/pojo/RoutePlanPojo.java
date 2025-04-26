package com.devs.roamance.pojo;

import com.devs.roamance.model.travel.Location;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class RoutePlanPojo {

  @JsonProperty(required = true)
  private Double routeTotalDistance;

  @JsonProperty(required = true)
  private Integer routeTotalTime;

  @JsonProperty(required = true)
  private String routeDescription;

  @JsonProperty(required = true)
  private List<Location> routeLocations = new ArrayList<>();
}
