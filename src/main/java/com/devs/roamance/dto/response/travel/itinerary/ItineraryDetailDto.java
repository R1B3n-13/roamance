package com.devs.roamance.dto.response.travel.itinerary;

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
public class ItineraryDetailDto extends ItineraryBriefDto {

  private List<String> notes = new ArrayList<>();
  private List<DayPlanBriefDto> dayPlans = new ArrayList<>();
}
