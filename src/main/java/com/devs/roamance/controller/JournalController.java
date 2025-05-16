package com.devs.roamance.controller;

import com.devs.roamance.dto.request.NearByFindRequestDto;
import com.devs.roamance.dto.request.travel.journal.JournalCreateRequestDto;
import com.devs.roamance.dto.request.travel.journal.JournalUpdateRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.travel.journal.JournalListResponseDto;
import com.devs.roamance.dto.response.travel.journal.JournalResponseDto;
import com.devs.roamance.service.JournalService;
import com.devs.roamance.util.PaginationSortingUtil;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/travel/journals")
public class JournalController {

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

    log.info("Getting journals based on user role with pagination");

    int[] validatedParams = PaginationSortingUtil.validatePaginationParams(pageNumber, pageSize);

    JournalListResponseDto journals =
        journalService.getAll(validatedParams[0], validatedParams[1], sortBy, sortDir);

    return ResponseEntity.ok(journals);
  }

  @GetMapping("/{id}")
  public ResponseEntity<JournalResponseDto> getJournalById(@PathVariable UUID id) {
    JournalResponseDto journal = journalService.get(id);
    log.info(
        "Retrieved journal with id: {} and title: {}",
        journal.getData().getId(),
        journal.getData().getTitle());
    log.info(
        "Journal has {} subsections fetched via JOIN FETCH",
        journal.getData().getSubsections().size());
    if (!journal.getData().getSubsections().isEmpty()) {
      log.info(
          "First subsection title: {}", journal.getData().getSubsections().getFirst().getTitle());
    }

    return ResponseEntity.ok(journal);
  }

  @PostMapping("/nearby")
  public ResponseEntity<JournalListResponseDto> getNearbyJournals(
      @Valid @RequestBody NearByFindRequestDto requestDto,
      @RequestParam(defaultValue = "0") int pageNumber,
      @RequestParam(defaultValue = "10") int pageSize,
      @RequestParam(defaultValue = "audit.createdAt") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {

    int[] validatedParams = PaginationSortingUtil.validatePaginationParams(pageNumber, pageSize);

    JournalListResponseDto responseDto =
        journalService.getNearby(
            requestDto, validatedParams[0], validatedParams[1], sortBy, sortDir);

    return ResponseEntity.ok(responseDto);
  }

  @GetMapping("/public")
  public ResponseEntity<JournalListResponseDto> getPublicJournals(
      @RequestParam(defaultValue = "0") int pageNumber,
      @RequestParam(defaultValue = "10") int pageSize,
      @RequestParam(defaultValue = "audit.createdAt") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {

    log.info("Getting public journals (isShared=true) with pagination");

    int[] validatedParams = PaginationSortingUtil.validatePaginationParams(pageNumber, pageSize);

    JournalListResponseDto journals =
        journalService.getPublic(validatedParams[0], validatedParams[1], sortBy, sortDir);

    return ResponseEntity.ok(journals);
  }

  @PostMapping
  public ResponseEntity<JournalResponseDto> createJournal(
      @RequestBody JournalCreateRequestDto journal) {
    log.info("Creating journal with title: '{}'", journal.getTitle());
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
