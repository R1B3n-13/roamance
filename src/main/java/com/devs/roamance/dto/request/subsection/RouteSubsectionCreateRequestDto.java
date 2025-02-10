package com.devs.roamance.dto.request.subsection;

import com.devs.roamance.dto.request.LocationCreateRequestDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public class RouteSubsectionCreateRequestDto extends SubsectionCreateRequestDto {
    @NotEmpty(message = "At least one route location is required")
    @Valid
    private List<LocationCreateRequestDto> locations;

    @NotNull(message = "Total time is required")
    @Min(value = 1, message = "Total time must be at least 1 minute")
    private Integer totalTime;

    @NotNull(message = "Total distance is required")
    @Positive(message = "Total distance must be positive")
    private Double totalDistance;
}