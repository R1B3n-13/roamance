package com.devs.roamance.dto.common;

import com.devs.roamance.dto.request.travel.itinerary.ItineraryCreateRequestDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;
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
public class AiPoweredItineraryDto extends ItineraryCreateRequestDto {

  @JsonProperty("day_plans")
  @Size(
      max = 30,
      message =
          "Maximum 30 days allowed per itinerary when batch creating after generating from AI.")
  private List<AiPoweredDayPlanDto> dayPlans = new ArrayList<>();
}
