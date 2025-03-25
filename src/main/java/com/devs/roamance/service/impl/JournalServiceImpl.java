package com.devs.roamance.service.impl;

import com.devs.roamance.model.travel.journal.Journal;
import com.devs.roamance.model.travel.journal.Subsection;
import com.devs.roamance.repository.JournalRepository;
import com.devs.roamance.service.JournalService;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class JournalServiceImpl implements JournalService {
  private static final Logger logger = LoggerFactory.getLogger(JournalServiceImpl.class);

  private final JournalRepository journalRepository;

  @Autowired
  public JournalServiceImpl(JournalRepository journalRepository) {
    this.journalRepository = journalRepository;
  }

  @Override
  public List<Journal> getAllJournals() {
    return journalRepository.findAll();
  }

  @Override
  public Journal getJournalById(UUID id) {
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

  @Override
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

  @Override
  public Journal updateJournal(UUID id, Journal journalDetails) {
    Journal journal = getJournalById(id);
    journal.setTitle(journalDetails.getTitle());
    journal.setDescription(journalDetails.getDescription());
    journal.setDestination(journalDetails.getDestination());
    return journalRepository.save(journal);
  }

  @Override
  public void deleteJournal(UUID id) {
    Journal journal = getJournalById(id);
    journalRepository.delete(journal);
  }
}
