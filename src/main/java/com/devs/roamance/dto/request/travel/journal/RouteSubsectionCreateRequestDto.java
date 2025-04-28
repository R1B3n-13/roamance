package com.devs.roamance.dto.request.travel.journal;

import com.devs.roamance.dto.request.travel.LocationCreateRequestDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
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
public class RouteSubsectionCreateRequestDto extends SubsectionCreateRequestDto {
  @NotEmpty(message = "At least one route location is required")
  @Valid
  private List<LocationCreateRequestDto> waypoints = new ArrayList<>();
}
