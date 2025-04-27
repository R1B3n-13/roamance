package com.devs.roamance.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;
import dev.langchain4j.model.output.structured.Description;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
@Description("Detailed plan for a day in the itinerary.")
public class DayPlanPojo {

  @Description(
      "Date for this day's plan. Must be within itinerary start and end dates. Format: YYYY-MM-DD.")
  @JsonProperty(required = true)
  private LocalDate date;

  @Description("Route plan connecting activities for this day.")
  @JsonProperty(required = true)
  private RoutePlanPojo routePlan;

  @Description("Activities scheduled for this day. Keep it within 3-5 activities.")
  @JsonProperty(required = true)
  private List<ActivityPojo> activities = new ArrayList<>();

  @Description("Specific notes for this day. Keep it within 2-3 short notes.")
  @JsonProperty(required = true)
  private List<String> notes = new ArrayList<>();
}
