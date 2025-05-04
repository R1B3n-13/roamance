package com.devs.roamance.repository;

import com.devs.roamance.model.travel.itinerary.Itinerary;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;

public interface ItineraryRepository extends JpaRepository<Itinerary, UUID> {

  @NonNull
  @EntityGraph(attributePaths = {"locations", "notes"}) // necessary fields from detail dto
  Optional<Itinerary> findById(@NonNull UUID id);

  @Query("SELECT i FROM Itinerary i WHERE i.id IN :ids")
  Page<Itinerary> findByIds(@Param("ids") List<UUID> ids, Pageable pageable);

  @Query("SELECT i FROM Itinerary i WHERE i.id = :id")
  Optional<Itinerary> findByIdLite(UUID id);

  Page<Itinerary> findAllByUserId(UUID userId, Pageable pageable);

  // Find nearby itineraries
  @Query(
      value =
          """
        SELECT DISTINCT i.id
        FROM itineraries i
        JOIN itinerary_locations l ON l.itinerary_id = i.id
        WHERE (6371 * acos(
            cos(radians(:lat)) * cos(radians(l.latitude)) *
            cos(radians(l.longitude) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(l.latitude))
        )) < :radiusKm
        LIMIT :limit OFFSET :offset
        """,
      nativeQuery = true)
  List<UUID> findNearby(
      @Param("lat") double latitude,
      @Param("lng") double longitude,
      @Param("radiusKm") double radiusKm,
      @Param("limit") int limit,
      @Param("offset") int offset);
}
