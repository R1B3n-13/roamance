package com.devs.roamance.dto.response.travel.journal;

import com.devs.roamance.dto.response.LocationResponseDto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActivitySubsectionResponseDto extends SubsectionResponseDto {
    private LocationResponseDto location;
    private String activityName;
}
