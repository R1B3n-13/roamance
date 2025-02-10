package com.devs.roamance.dto.request.subsection;

import com.devs.roamance.dto.request.LocationUpdateRequestDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

public class ActivitySubsectionUpdateRequestDto extends SubsectionUpdateRequestDto {
    @Valid
    private LocationUpdateRequestDto location;

    @Size(max = 50, message = "Activity name must be less than 50 characters")
    private String activityName;
}