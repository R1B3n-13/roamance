package com.devs.roamance.repository;

import com.devs.roamance.model.travel.itinerary.DayPlan;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;

public interface DayPlanRepository extends JpaRepository<DayPlan, UUID> {

  @NonNull
  @EntityGraph(attributePaths = {"activities", "notes"})
  Optional<DayPlan> findById(@NonNull UUID id);

  Page<DayPlan> findAllByItineraryId(UUID itineraryId, Pageable pageable);
}
