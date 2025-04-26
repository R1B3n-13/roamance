package com.devs.roamance.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;
import dev.langchain4j.model.output.structured.Description;
import java.math.BigDecimal;
import java.time.LocalTime;
import lombok.Data;

@Data
@Description("Activities of a day plan.")
public class ActivityPojo {

  @Description("Location where the activity takes place.")
  @JsonProperty(required = true)
  private LocationPojo location;

  @Description("Start time of the activity. Format: HH:MM.")
  @JsonProperty(required = true)
  private LocalTime startTime;

  @Description("End time of the activity. Format: HH:MM.")
  @JsonProperty(required = true)
  private LocalTime endTime;

  @Description(
      "Type of activity: Sightseeing, Food & Dining, Entertainment, Cultural Experience, Hiking, Surfing, Bungee Jumping, Local Attraction etc.")
  @JsonProperty(required = true)
  private String type;

  @Description("Detailed description of the activity.")
  @JsonProperty(required = true)
  private String note;

  @Description("Cost of the activity per person.")
  @JsonProperty(required = true)
  private BigDecimal cost;
}
