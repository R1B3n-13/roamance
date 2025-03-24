package com.devs.roamance.repository;

import com.devs.roamance.model.travel.journal.Journal;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JournalRepository extends JpaRepository<Journal, Long> {

  @Query("SELECT j FROM Journal j LEFT JOIN FETCH j.subsections WHERE j.id = :id")
  Optional<Journal> findByIdWithSubsections(@Param("id") Long id);
}
