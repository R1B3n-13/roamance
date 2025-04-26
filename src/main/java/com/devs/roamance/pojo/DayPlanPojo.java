package com.devs.roamance.pojo;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class DayPlanPojo {
  private LocalDate date;
  private RoutePlanPojo routePlan;
  private List<ActivityPojo> activities = new ArrayList<>();
  private List<String> notes = new ArrayList<>();
}
