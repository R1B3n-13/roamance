package com.devs.roamance.pojo;

import com.devs.roamance.model.travel.Location;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.Data;

@Data
public class ItineraryPojo {

  @JsonProperty(required = true)
  private Set<Location> locations = new HashSet<>();

  private String title;

  @JsonProperty(required = true)
  private String description;

  @JsonProperty(required = true)
  private LocalDate startDate;

  @JsonProperty(required = true)
  private LocalDate endDate;

  @JsonProperty(required = true)
  private List<DayPlanPojo> dayPlans = new ArrayList<>();

  @JsonProperty(required = true)
  private List<String> notes = new ArrayList<>();
}
