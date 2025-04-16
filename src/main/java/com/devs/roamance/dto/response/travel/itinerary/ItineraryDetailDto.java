package com.devs.roamance.dto.response.travel.itinerary;

import com.devs.roamance.model.travel.Location;
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

  private List<Location> locations;

  private List<String> notes = new ArrayList<>();
}
