package com.devs.roamance.dto.request.travel.journal;

import com.devs.roamance.dto.request.travel.LocationUpdateRequestDto;
import com.devs.roamance.model.common.ActivityType;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActivitySubsectionUpdateRequestDto extends SubsectionUpdateRequestDto {
  @Valid private LocationUpdateRequestDto location;

  @JsonProperty("activity_type")
  private ActivityType activityType;
}
