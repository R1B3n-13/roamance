package com.devs.roamance.dto.request.subsection;

import com.devs.roamance.dto.request.LocationCreateRequestDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

public class ActivitySubsectionCreateRequestDto extends SubsectionCreateRequestDto {
    @Valid
    @NotNull(message = "Location is required for activity")
    private LocationCreateRequestDto location;

    @NotBlank(message = "Activity name is required")
    @Size(max = 50, message = "Activity name must be less than 50 characters")
    private String activityName;
}