package com.devs.roamance.pojo;

import com.devs.roamance.model.travel.Location;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.Data;

@Data
public class ItineraryPojo {
  private Set<Location> locations = new HashSet<>();
  private String title;
  private String description;
  private LocalDate startDate;
  private LocalDate endDate;
  private List<DayPlanPojo> dayPlans = new ArrayList<>();
  private List<String> notes = new ArrayList<>();
}
