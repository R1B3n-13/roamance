package com.devs.roamance.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;
import dev.langchain4j.model.output.structured.Description;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.Data;

@Data
@Description("The itinerary.")
public class ItineraryPojo {

  @Description("Set of locations included in this itinerary. Must not exceed 30.")
  @JsonProperty(required = true)
  private Set<LocationPojo> locations = new HashSet<>();

  @Description("Title of the itinerary. Must be less than 100 characters.")
  private String title;

  @Description("Detailed description of the itinerary.")
  @JsonProperty(required = true)
  private String description;

  @Description("Start date of the itinerary. Format: YYYY-MM-DD.")
  @JsonProperty(required = true)
  private LocalDate startDate;

  @Description("End date of the itinerary. Format: YYYY-MM-DD.")
  @JsonProperty(required = true)
  private LocalDate endDate;

  @Description("Detailed plans for each day of the itinerary.")
  @JsonProperty(required = true)
  private List<DayPlanPojo> dayPlans = new ArrayList<>();

  @Description("General notes about the entire itinerary. Keep it within 3-5 short notes.")
  @JsonProperty(required = true)
  private List<String> notes = new ArrayList<>();
}
