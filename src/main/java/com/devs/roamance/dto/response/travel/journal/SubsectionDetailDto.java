package com.devs.roamance.dto.response.travel.journal;

import com.devs.roamance.dto.response.travel.LocationResponseDto;
import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SubsectionDetailDto extends SubsectionBriefDto {
  private List<String> notes = new ArrayList<>();
  private List<String> checklists = new ArrayList<>();

  // For Activity Subsection
  private LocationResponseDto waypoints;

  @JsonProperty("activity_name")
  private String activityName;

  // For Route Subsection
  private List<LocationResponseDto> locations = new ArrayList<>();

  @JsonProperty("total_time")
  private Integer totalTime;

  @JsonProperty("total_distance")
  private Double totalDistance;
}
