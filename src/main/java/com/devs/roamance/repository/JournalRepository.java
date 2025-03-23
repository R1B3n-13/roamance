package com.devs.roamance.repository;

import com.devs.roamance.model.travel.journal.Journal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JournalRepository extends JpaRepository<Journal, Long> {}
