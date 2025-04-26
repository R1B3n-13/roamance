package com.devs.roamance.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;
import dev.langchain4j.model.output.structured.Description;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
@Description("Route plan for a day plan of itinerary connecting activities.")
public class RoutePlanPojo {

  @Description("Total distance of the route in kilometers.")
  @JsonProperty(required = true)
  private Double routeTotalDistance;

  @Description("Total travel time of the route in minutes.")
  @JsonProperty(required = true)
  private Integer routeTotalTime;

  @Description(
      "Description of the route e.g., transportation methods, scenery, general descriptions etc.")
  @JsonProperty(required = true)
  private String routeDescription;

  @Description(
      "List of locations in the order they will be visited. Should be in a logical visiting order for a day's activities.")
  @JsonProperty(required = true)
  private List<LocationPojo> routeLocations = new ArrayList<>();
}
