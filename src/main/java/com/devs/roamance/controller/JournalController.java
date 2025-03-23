package com.devs.roamance.controller;

import com.devs.roamance.model.travel.journal.Journal;
import com.devs.roamance.service.JournalService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/journals")
public class JournalController {

  @Autowired private JournalService journalService;

  @GetMapping
  public List<Journal> getAllJournals() {
    return journalService.getAllJournals();
  }

  @GetMapping("/{id}")
  public Journal getJournalById(@PathVariable Long id) {
    return journalService.getJournalById(id);
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
