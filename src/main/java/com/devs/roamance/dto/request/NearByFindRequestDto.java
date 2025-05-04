package com.devs.roamance.dto.request;

import com.devs.roamance.dto.request.travel.LocationCreateRequestDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.Range;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NearByFindRequestDto {

  @NotNull(message = "Location is required for nearby search")
  LocationCreateRequestDto location;

  @JsonProperty("radius_km")
  @Range(min = 0, max = 10, message = "No more than 10 km is allowed for nearby search")
  double radiusKm = 0;
}
