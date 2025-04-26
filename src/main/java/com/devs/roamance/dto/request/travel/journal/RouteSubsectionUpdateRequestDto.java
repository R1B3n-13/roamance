package com.devs.roamance.dto.request.travel.journal;

import com.devs.roamance.dto.request.travel.LocationUpdateRequestDto;
import jakarta.validation.Valid;
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
public class RouteSubsectionUpdateRequestDto extends SubsectionUpdateRequestDto {
  @Valid private List<LocationUpdateRequestDto> waypoints = new ArrayList<>();
}
