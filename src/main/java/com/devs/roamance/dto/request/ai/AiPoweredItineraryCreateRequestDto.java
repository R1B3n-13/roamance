package com.devs.roamance.dto.request.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.Range;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiPoweredItineraryCreateRequestDto {

  @NotBlank(message = "Location is required")
  private String location;

  @JsonProperty("start_date")
  @NotNull(message = "Starting date is required")
  private LocalDate startDate;

  @JsonProperty("number_of_days")
  @NotNull(message = "Number of days are required")
  @Range(min = 1, max = 7, message = "Number of days must be between 1 and 7")
  private Integer numberOfDays;

  @JsonProperty("budget_level")
  @NotBlank(message = "Budget level is required")
  private String budgetLevel;

  @JsonProperty("number_of_people")
  @NotNull(message = "Number of people are required")
  @Range(min = 1, max = 1000, message = "Number of people must be between 1 and 1000")
  private Integer numberOfPeople;
}
