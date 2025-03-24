package com.devs.roamance.controller;

import com.devs.roamance.model.travel.journal.Journal;
import com.devs.roamance.service.JournalService;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/journals")
public class JournalController {

  private static final Logger logger = LoggerFactory.getLogger(JournalController.class);
  private JournalService journalService;

  @GetMapping
  public List<Journal> getAllJournals() {
    return journalService.getAllJournals();
  }

  @GetMapping("/{id}")
  public Journal getJournalById(@PathVariable Long id) {
    Journal journal = journalService.getJournalById(id);
    logger.info("Retrieved journal with id: {} and title: {}", journal.getId(), journal.getTitle());
    logger.info(
        "Journal has {} subsections fetched via JOIN FETCH", journal.getSubsections().size());
    if (!journal.getSubsections().isEmpty()) {
      logger.info("First subsection title: {}", journal.getSubsections().get(0).getTitle());
    }
    return journal;
  }

  @PostMapping
  public Journal createJournal(@RequestBody Journal journal) {
    return journalService.createJournal(journal);
  }

  @PutMapping("/{id}")
  public Journal updateJournal(@PathVariable Long id, @RequestBody Journal journal) {
    return journalService.updateJournal(id, journal);
  }

  @DeleteMapping("/{id}")
  public void deleteJournal(@PathVariable Long id) {
    journalService.deleteJournal(id);
  }
}
