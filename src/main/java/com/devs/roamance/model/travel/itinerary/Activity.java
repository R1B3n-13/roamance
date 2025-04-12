package com.devs.roamance.model.travel.itinerary;

import com.devs.roamance.model.travel.Location;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Activity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Embedded private Location location;

  @Enumerated(EnumType.STRING)
  @NotNull
  private ActivityType type;

  private String otherTypeName; // Set only when type is OTHER otherwise null

  @NotNull private LocalTime startTime;
  @NotNull private LocalTime endTime;

  private BigDecimal cost = BigDecimal.ZERO;

  @JsonIgnore
  @ManyToOne(
      fetch = FetchType.LAZY,
      cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.DETACH, CascadeType.REFRESH})
  @JoinColumn(name = "day_plan_id", referencedColumnName = "id")
  private DayPlan dayPlan;
}
