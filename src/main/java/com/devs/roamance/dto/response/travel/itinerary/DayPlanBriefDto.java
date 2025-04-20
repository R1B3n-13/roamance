package com.devs.roamance.dto.response.travel.itinerary;

import com.devs.roamance.dto.response.AuditDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Embedded;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DayPlanBriefDto {

  private UUID id;
  private LocalDate date;

  @JsonProperty("total_cost")
  private BigDecimal totalCost;

  @Embedded private AuditDto audit = new AuditDto();
}
