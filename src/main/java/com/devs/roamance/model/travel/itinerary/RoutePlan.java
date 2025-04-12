package com.devs.roamance.model.travel.itinerary;

import com.devs.roamance.model.travel.Location;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.FetchType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoutePlan {

  @Min(0)
  private Double totalDistance;

  @Min(0)
  private Integer totalTime;

  private String routeDescription;

  @Size(min = 1, max = 100)
  @ElementCollection(fetch = FetchType.LAZY)
  private List<Location> locations = new ArrayList<>();
}
