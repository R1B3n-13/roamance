package com.devs.roamance.service;

import com.devs.roamance.model.travel.journal.Journal;
import java.util.List;
import java.util.UUID;

public interface JournalService {

  List<Journal> getAllJournals();

  List<Journal> getJournalsByUserRole();

  Journal getJournalById(UUID id);

  Journal createJournal(Journal journal);

  Journal updateJournal(UUID id, Journal journalDetails);

  void deleteJournal(UUID id);
}
