package com.devs.roamance.dto.response.subsection;

import com.devs.roamance.dto.response.LocationResponseDto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RouteSubsectionResponseDto extends SubsectionResponseDto {
    private List<LocationResponseDto> locations;
    private Integer totalTime;
    private Double totalDistance;
}
