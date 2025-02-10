package com.devs.roamance.dto.request.subsection;

import com.devs.roamance.dto.request.LocationUpdateRequestDto;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SightseeingSubsectionUpdateRequestDto extends SubsectionUpdateRequestDto {
    @Valid
    private LocationUpdateRequestDto location;
}