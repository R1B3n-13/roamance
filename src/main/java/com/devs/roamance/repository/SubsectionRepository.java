package com.devs.roamance.repository;

import com.devs.roamance.model.travel.journal.Subsection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubsectionRepository extends JpaRepository<Subsection, UUID> {

  @EntityGraph(attributePaths = {"journal"})
  List<Subsection> findByJournalId(UUID journalId);

  @EntityGraph(attributePaths = {"journal"})
  Page<Subsection> findAllByJournal_Audit_CreatedBy(UUID userId, Pageable pageable);
}
