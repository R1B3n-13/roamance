package com.devs.roamance.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class DayPlanPojo {

  @JsonProperty(required = true)
  private LocalDate date;

  @JsonProperty(required = true)
  private RoutePlanPojo routePlan;

  @JsonProperty(required = true)
  private List<ActivityPojo> activities = new ArrayList<>();

  @JsonProperty(required = true)
  private List<String> notes = new ArrayList<>();
}
