package com.devs.roamance.dto.request.subsection;

import com.devs.roamance.dto.request.LocationCreateRequestDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public class SightseeingSubsectionCreateRequestDto {
    @Valid
    @NotNull(message = "Location is required for sightseeing")
    private LocationCreateRequestDto location;
}
