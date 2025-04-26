package com.devs.roamance.pojo;

import com.devs.roamance.model.travel.Location;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class RoutePlanPojo {
  private Double routeTotalDistance;
  private Integer routeTotalTime;
  private String routeDescription;
  private List<Location> routeLocations = new ArrayList<>();
}
