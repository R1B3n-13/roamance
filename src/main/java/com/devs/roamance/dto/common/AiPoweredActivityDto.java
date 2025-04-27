package com.devs.roamance.dto.common;

import com.devs.roamance.dto.request.travel.LocationCreateRequestDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiPoweredActivityDto {

  @NotNull(message = "Location is required")
  private LocationCreateRequestDto location;

  @NotBlank(message = "Activity type is required")
  private String type;

  @JsonProperty("start_time")
  @NotNull(message = "Start time is required")
  private LocalTime startTime;

  @JsonProperty("end_time")
  @NotNull(message = "End time is required")
  private LocalTime endTime;

  @Size(max = 10_000, message = "Note can not contain more than 10000 character")
  private String note;

  @DecimalMin(value = "0.0", message = "Cost cannot be negative")
  private BigDecimal cost;
}
