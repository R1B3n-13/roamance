package com.devs.roamance.dto.request.travel.journal;

import com.devs.roamance.dto.request.travel.LocationCreateRequestDto;
import com.devs.roamance.model.common.ActivityType;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActivitySubsectionCreateRequestDto extends SubsectionCreateRequestDto {
  @Valid
  @NotNull(message = "Location is required for activity")
  private LocationCreateRequestDto location;

  @NotNull(message = "Activity type is required")
  @JsonProperty("activity_type")
  private ActivityType activityType = ActivityType.OTHER;
}
