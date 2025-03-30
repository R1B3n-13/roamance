package com.devs.roamance.controller;

import com.devs.roamance.dto.request.travel.journal.JournalCreateRequestDto;
import com.devs.roamance.dto.request.travel.journal.JournalUpdateRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.travel.journal.JournalListResponseDto;
import com.devs.roamance.dto.response.travel.journal.JournalResponseDto;
import com.devs.roamance.service.JournalService;
import com.devs.roamance.util.PaginationSortingUtil;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/journals")
public class JournalController {

  private static final Logger logger = LoggerFactory.getLogger(JournalController.class);
  private final JournalService journalService;

  public JournalController(JournalService journalService) {
    this.journalService = journalService;
  }

  @GetMapping
  public ResponseEntity<JournalListResponseDto> getAllJournals(
      @RequestParam(defaultValue = "0") int pageNumber,
      @RequestParam(defaultValue = "10") int pageSize,
      @RequestParam(defaultValue = "id") String sortBy,
      @RequestParam(defaultValue = "asc") String sortDir) {

    logger.info("Getting journals based on user role with pagination");

    int[] validatedParams = PaginationSortingUtil.validatePaginationParams(pageNumber, pageSize);

    JournalListResponseDto journals =
        journalService.getAll(validatedParams[0], validatedParams[1], sortBy, sortDir);

    return ResponseEntity.ok(journals);
  }

  @GetMapping("/{id}")
  public ResponseEntity<JournalResponseDto> getJournalById(@PathVariable UUID id) {
    JournalResponseDto journal = journalService.get(id);
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
    BaseResponseDto deletedJournal = journalService.delete(id);

    return ResponseEntity.ok(deletedJournal);
  }
}
