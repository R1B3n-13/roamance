package com.devs.roamance.repository;

import com.devs.roamance.model.travel.journal.Subsection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SubsectionRepository extends JpaRepository<Subsection, UUID> {

  @Query("SELECT s FROM Subsection s WHERE s.journal.id = :journalId")
  List<Subsection> findByJournalId(@Param("journalId") UUID journalId);
}
