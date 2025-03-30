package com.devs.roamance.dto;

import com.devs.roamance.model.Location;
import com.devs.roamance.model.travel.journal.SubsectionType;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // This will exclude null fields from JSON serialization
public class SubsectionDto {
  private UUID id;
  private String title;
  private List<String> notes;
  private List<String> checklists;
  private SubsectionType type;
  private UUID journalId;

  // Fields for activity subsection
  private Location location;
  private String activityName;

  // Fields for route subsection
  private List<Location> locations;
  private Integer totalTime;
  private Double totalDistance;
}
