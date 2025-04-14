package com.devs.roamance.repository;

import com.devs.roamance.model.travel.itinerary.Itinerary;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;

public interface ItineraryRepository extends JpaRepository<Itinerary, UUID> {

  @NonNull
  @EntityGraph(attributePaths = {"notes", "dayPlans"})
  Optional<Itinerary> findById(@NonNull UUID id);

  Page<Itinerary> findAllByUserId(UUID userId, Pageable pageable);
}
