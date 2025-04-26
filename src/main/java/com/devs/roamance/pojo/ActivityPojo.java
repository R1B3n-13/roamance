package com.devs.roamance.pojo;

import com.devs.roamance.model.travel.Location;
import java.math.BigDecimal;
import java.time.LocalTime;
import lombok.Data;

@Data
public class ActivityPojo {
  private Location location;
  private LocalTime startTime;
  private LocalTime endTime;
  private String type;
  private String note;
  private BigDecimal cost;
}
