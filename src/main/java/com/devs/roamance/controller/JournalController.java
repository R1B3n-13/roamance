package com.devs.roamance.controller;

import com.devs.roamance.constant.ResponseMessage;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.JournalListResponseDto;
import com.devs.roamance.dto.response.JournalResponseDto;
import com.devs.roamance.model.travel.journal.Journal;
import com.devs.roamance.service.JournalService;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/journals")
public class JournalController {

  private static final Logger logger = LoggerFactory.getLogger(JournalController.class);
  private final JournalService journalService;

  @Autowired
  public JournalController(JournalService journalService) {
    this.journalService = journalService;
  }

  @GetMapping
  public ResponseEntity<JournalListResponseDto> getAllJournals() {
    // This now uses role-based access - ADMIN gets all journals, USER gets only their journals
    logger.info("Getting journals based on user role");
    List<Journal> journals = journalService.getJournalsByUserRole();

    JournalListResponseDto responseDto =
        new JournalListResponseDto(
            HttpStatus.OK.value(), true, ResponseMessage.JOURNALS_FETCH_SUCCESS, journals);

    return ResponseEntity.ok(responseDto);
  }

  @GetMapping("/{id}")
  public ResponseEntity<JournalResponseDto> getJournalById(@PathVariable UUID id) {
    Journal journal = journalService.getJournalById(id);
    logger.info("Retrieved journal with id: {} and title: {}", journal.getId(), journal.getTitle());
    logger.info(
        "Journal has {} subsections fetched via JOIN FETCH", journal.getSubsections().size());
    if (!journal.getSubsections().isEmpty()) {
      logger.info("First subsection title: {}", journal.getSubsections().get(0).getTitle());
    }

    JournalResponseDto responseDto =
        new JournalResponseDto(
            HttpStatus.OK.value(), true, ResponseMessage.JOURNAL_FETCH_SUCCESS, journal);

    return ResponseEntity.ok(responseDto);
  }

  @PostMapping
  public ResponseEntity<JournalResponseDto> createJournal(@RequestBody Journal journal) {
    Journal createdJournal = journalService.createJournal(journal);

    JournalResponseDto responseDto =
        new JournalResponseDto(
            HttpStatus.CREATED.value(),
            true,
            ResponseMessage.JOURNAL_CREATE_SUCCESS,
            createdJournal);

    return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
  }

  @PutMapping("/{id}")
  public ResponseEntity<JournalResponseDto> updateJournal(
      @PathVariable UUID id, @RequestBody Journal journal) {
    Journal updatedJournal = journalService.updateJournal(id, journal);

    JournalResponseDto responseDto =
        new JournalResponseDto(
            HttpStatus.OK.value(), true, ResponseMessage.JOURNAL_UPDATE_SUCCESS, updatedJournal);

    return ResponseEntity.ok(responseDto);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<BaseResponseDto> deleteJournal(@PathVariable UUID id) {
    journalService.deleteJournal(id);

    BaseResponseDto responseDto =
        new BaseResponseDto(HttpStatus.OK.value(), true, ResponseMessage.JOURNAL_DELETE_SUCCESS);

    return ResponseEntity.ok(responseDto);
  }
}
