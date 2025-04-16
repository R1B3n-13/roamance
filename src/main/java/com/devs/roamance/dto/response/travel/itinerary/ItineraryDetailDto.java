package com.devs.roamance.dto.response.travel.itinerary;

import com.devs.roamance.model.travel.Location;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryDetailDto extends ItineraryBriefDto {

  private Set<Location> locations = new LinkedHashSet<>();

  private List<String> notes = new ArrayList<>();
}
