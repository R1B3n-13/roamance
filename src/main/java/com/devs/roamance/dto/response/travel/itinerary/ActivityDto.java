package com.devs.roamance.dto.response.travel.itinerary;

import com.devs.roamance.dto.response.AuditDto;
import com.devs.roamance.model.travel.Location;
import com.devs.roamance.model.travel.itinerary.ActivityType;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDto extends AuditDto {

  private UUID id;
  private Location location;
  private LocalTime startTime;
  private LocalTime endTime;
  private ActivityType type;
  private String otherTypeName;
  private String note;
  private BigDecimal cost;
}
