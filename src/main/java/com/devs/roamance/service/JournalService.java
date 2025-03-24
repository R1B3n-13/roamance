package com.devs.roamance.service;

import com.devs.roamance.model.travel.journal.Journal;
import java.util.List;

public interface JournalService {

  List<Journal> getAllJournals();

  Journal getJournalById(Long id);

  Journal createJournal(Journal journal);

  Journal updateJournal(Long id, Journal journalDetails);

  void deleteJournal(Long id);
}
