package com.devs.roamance.dto.common;

import com.devs.roamance.dto.request.travel.itinerary.ItineraryCreateRequestDto;
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
public class AiPoweredItineraryDto extends ItineraryCreateRequestDto {

  @JsonProperty("day_plans")
  private List<AiPoweredDayPlanDto> dayPlans = new ArrayList<>();
}
