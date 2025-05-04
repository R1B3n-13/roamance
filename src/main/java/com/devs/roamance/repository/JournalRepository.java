package com.devs.roamance.repository;

import com.devs.roamance.model.travel.journal.Journal;
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
import org.springframework.stereotype.Repository;

@Repository
public interface JournalRepository extends JpaRepository<Journal, UUID> {

  @EntityGraph(attributePaths = {"subsections"})
  @NonNull
  Optional<Journal> findById(@NonNull UUID id);

  @EntityGraph(attributePaths = {"subsections"})
  @NonNull
  List<Journal> findAll();

  @EntityGraph(attributePaths = {"subsections"})
  Page<Journal> findAllByAudit_CreatedBy(UUID createdBy, Pageable pageable);

  // Find nearby journals
  @Query(
      value =
          """
                SELECT * FROM (
                    SELECT j.*,
                           (6371 * acos(
                               cos(radians(:lat)) * cos(radians(j.latitude)) *
                               cos(radians(j.longitude) - radians(:lng)) +
                               sin(radians(:lat)) * sin(radians(j.latitude))
                           )) AS distance
                    FROM journals j
                ) AS sub
                WHERE distance < :radiusKm
                """,
      countQuery =
          """
                SELECT COUNT(*) FROM (
                    SELECT (6371 * acos(
                               cos(radians(:lat)) * cos(radians(j.latitude)) *
                               cos(radians(j.longitude) - radians(:lng)) +
                               sin(radians(:lat)) * sin(radians(j.latitude))
                           )) AS distance
                    FROM journals j
                ) AS sub
                WHERE distance < :radiusKm
                """,
      nativeQuery = true)
  Page<Journal> findNearby(
      @Param("lat") double latitude,
      @Param("lng") double longitude,
      @Param("radiusKm") double radiusKm,
      Pageable pageable);
}
