package com.devs.roamance.service;

import com.devs.roamance.model.travel.journal.Journal;
import com.devs.roamance.repository.JournalRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class JournalService {
  @Autowired private JournalRepository journalRepository;

  public List<Journal> getAllJournals() {
    return journalRepository.findAll();
  }

  public Journal getJournalById(Long id) {
    return journalRepository
        .findById(id)
        .orElseThrow(() -> new RuntimeException("Journal not found"));
  }

  public Journal createJournal(Journal journal) {
    return journalRepository.save(journal);
  }

  public Journal updateJournal(Long id, Journal journalDetails) {
    Journal journal = getJournalById(id);
    journal.setTitle(journalDetails.getTitle());
    journal.setDescription(journalDetails.getDescription());
    journal.setDestination(journalDetails.getDestination());
    return journalRepository.save(journal);
  }

  public void deleteJournal(Long id) {
    Journal journal = getJournalById(id);
    journalRepository.delete(journal);
  }
}
