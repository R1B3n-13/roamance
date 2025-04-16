package com.devs.roamance.model.travel.itinerary;

import com.devs.roamance.exception.ScheduleCollisionException;
import com.devs.roamance.model.BaseEntity;
import com.devs.roamance.model.user.User;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Formula;

@Entity
@Table(
    name = "day_plans",
    uniqueConstraints = @UniqueConstraint(columnNames = {"itinerary_id", "date"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class DayPlan extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @NotNull private LocalDate date;

  @JsonIgnore
  @OneToMany(
      mappedBy = "dayPlan",
      fetch = FetchType.LAZY,
      cascade = {CascadeType.ALL},
      orphanRemoval = true)
  @OrderBy("startTime ASC")
  @Size(max = 50)
  private List<Activity> activities = new ArrayList<>();

  @Embedded private RoutePlan routePlan;

  @Size(max = 10)
  @ElementCollection(fetch = FetchType.LAZY)
  private List<@NotBlank @Size(max = 10_000) String> notes = new ArrayList<>();

  @Formula("(SELECT COALESCE(SUM(a.cost), 0) FROM activities a WHERE a.day_plan_id = id)")
  private BigDecimal totalCost = BigDecimal.ZERO;

  @JsonIgnore
  @ManyToOne(
      fetch = FetchType.LAZY,
      cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.DETACH, CascadeType.REFRESH})
  @JoinColumn(name = "itinerary_id", referencedColumnName = "id")
  private Itinerary itinerary;

  @JsonIgnore
  @ManyToOne(
      fetch = FetchType.EAGER,
      cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.DETACH, CascadeType.REFRESH})
  @JoinColumn(name = "user_id", referencedColumnName = "id")
  private User user;

  @PrePersist
  @PreUpdate
  private void validateNoTimeCollisions() {

    List<Activity> sortedActivities = new ArrayList<>(activities);
    sortedActivities.sort(Comparator.comparing(Activity::getStartTime));

    for (int i = 0; i < sortedActivities.size() - 1; i++) {

      Activity current = sortedActivities.get(i);
      Activity next = sortedActivities.get(i + 1);

      if (current.getEndTime() != null
          && next.getStartTime() != null
          && !current.getEndTime().isBefore(next.getStartTime())) {

        throw new ScheduleCollisionException(
            "Activity schedule collision detected between '"
                + (current.getType().getName() != null
                    ? current.getType().getName()
                    : current.getType())
                + "' and '"
                + (next.getType().getName() != null ? next.getType().getName() : next.getType())
                + "'");
      }
    }
  }
}
