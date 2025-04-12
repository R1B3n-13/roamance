package com.devs.roamance.model.travel.itinerary;

import com.devs.roamance.exception.DateOutOfRangeException;
import com.devs.roamance.model.travel.Location;
import com.devs.roamance.model.user.User;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Formula;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "itineraries")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Itinerary {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Size(min = 1, max = 10)
  @ElementCollection(fetch = FetchType.LAZY)
  private List<Location> locations;

  @Size(max = 100)
  private String title;

  @Size(max = 10_000)
  private String description;

  @NotNull private LocalDate startDate;
  @NotNull private LocalDate endDate;

  @Size(max = 10_000)
  private String notes;

  @Formula("(SELECT COALESCE(SUM(dp.total_cost), 0) FROM day_plans dp WHERE dp.itinerary_id = id)")
  private BigDecimal totalCost = BigDecimal.ZERO;

  @JsonIgnore
  @ManyToOne(
      fetch = FetchType.LAZY,
      cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.DETACH, CascadeType.REFRESH})
  @JoinColumn(name = "user_id", referencedColumnName = "id")
  private User user;

  @JsonIgnore
  @OneToMany(
      mappedBy = "itinerary",
      fetch = FetchType.LAZY,
      cascade = {CascadeType.ALL},
      orphanRemoval = true)
  @OrderBy("date ASC")
  private List<DayPlan> dayPlans = new ArrayList<>();

  @CreatedDate
  @Column(updatable = false)
  private OffsetDateTime createdAt;

  @LastModifiedDate private OffsetDateTime lastModifiedAt;

  @CreatedBy
  @Column(updatable = false)
  private UUID createdBy;

  @LastModifiedBy private UUID lastModifiedBy;

  @PrePersist
  @PreUpdate
  private void validateDateRange() {

    for (DayPlan plan : dayPlans) {

      if (plan.getDate().isBefore(startDate) || plan.getDate().isAfter(endDate)) {

        throw new DateOutOfRangeException("DayPlan date must be within itinerary date range");
      }
    }
  }

  public void touch() {
    // Method to touch the entity to manually trigger lastModifiedAt & lastModifiedBy
  }
}
