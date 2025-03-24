package com.devs.roamance.service;

import com.devs.roamance.model.travel.journal.Journal;
import com.devs.roamance.model.travel.journal.Subsection;
import com.devs.roamance.repository.JournalRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class JournalService {
  private static final Logger logger = LoggerFactory.getLogger(JournalService.class);

  private JournalRepository journalRepository;

  public List<Journal> getAllJournals() {
    return journalRepository.findAll();
  }

  public Journal getJournalById(Long id) {
    logger.info("Fetching journal with id: {} using JOIN FETCH for subsections", id);
    Journal journal =
        journalRepository
            .findByIdWithSubsections(id)
            .orElseThrow(() -> new RuntimeException("Journal not found"));
    logger.info(
        "Successfully fetched journal with title: '{}' and {} subsections",
        journal.getTitle(),
        journal.getSubsections().size());
    return journal;
  }

  public Journal createJournal(Journal journal) {
    logger.info(
        "Creating journal with title: '{}' and {} subsections",
        journal.getTitle(),
        journal.getSubsections().size());

    // Set up the bidirectional relationship for each subsection
    if (!journal.getSubsections().isEmpty()) {
      for (Subsection subsection : journal.getSubsections()) {
        subsection.setJournal(journal);
      }
      logger.info(
          "Established bidirectional relationship for {} subsections",
          journal.getSubsections().size());
    }

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
