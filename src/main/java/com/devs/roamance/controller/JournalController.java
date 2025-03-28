package com.devs.roamance.controller;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devs.roamance.dto.request.travel.journal.JournalCreateRequestDto;
import com.devs.roamance.dto.request.travel.journal.JournalUpdateRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.travel.journal.JournalListResponseDto;
import com.devs.roamance.dto.response.travel.journal.JournalResponseDto;
import com.devs.roamance.service.JournalService;

@RestController
@RequestMapping("/journals")
public class JournalController {

  private static final Logger logger = LoggerFactory.getLogger(JournalController.class);
  private final JournalService journalService;

  public JournalController(JournalService journalService) {
    this.journalService = journalService;
  }

  @GetMapping
  public ResponseEntity<JournalListResponseDto> getAllJournals() {
    logger.info("Getting journals based on user role");
    JournalListResponseDto journals = journalService.getByUserRole();
    return ResponseEntity.ok(journals);
  }

  @GetMapping("/{id}")
  public ResponseEntity<JournalResponseDto> getJournalById(@PathVariable UUID id) {
    JournalResponseDto journal = journalService.getById(id);
    logger.info(
        "Retrieved journal with id: {} and title: {}",
        journal.getData().getId(),
        journal.getData().getTitle());
    logger.info(
        "Journal has {} subsections fetched via JOIN FETCH",
        journal.getData().getSubsections().size());
    if (!journal.getData().getSubsections().isEmpty()) {
      logger.info(
          "First subsection title: {}", journal.getData().getSubsections().getFirst().getTitle());
    }

    return ResponseEntity.ok(journal);
  }

  @PostMapping
  public ResponseEntity<JournalResponseDto> createJournal(
      @RequestBody JournalCreateRequestDto journal) {
    logger.info("Creating journal with title: '{}'", journal.getTitle());
    JournalResponseDto createdJournal = journalService.create(journal);

    return ResponseEntity.status(HttpStatus.CREATED).body(createdJournal);
  }

  @PutMapping("/{id}")
  public ResponseEntity<JournalResponseDto> updateJournal(
      @PathVariable UUID id, @RequestBody JournalUpdateRequestDto journal) {
    JournalResponseDto updatedJournal = journalService.update(journal, id);

    return ResponseEntity.ok(updatedJournal);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<BaseResponseDto> deleteJournal(@PathVariable UUID id) {
    JournalResponseDto deletedJournal = journalService.delete(id);

    return ResponseEntity.ok(deletedJournal);
  }
}
