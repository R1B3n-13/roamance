package com.devs.roamance.controller;

import com.devs.roamance.dto.request.travel.journal.SubsectionCreateRequestDto;
import com.devs.roamance.dto.request.travel.journal.SubsectionUpdateRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.travel.journal.SubsectionListResponseDto;
import com.devs.roamance.dto.response.travel.journal.SubsectionResponseDto;
import com.devs.roamance.service.SubsectionService;
import com.devs.roamance.util.PaginationSortingUtil;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/travel/subsections")
public class SubsectionController {

  private static final Logger logger = LoggerFactory.getLogger(SubsectionController.class);
  private final SubsectionService subsectionService;

  public SubsectionController(SubsectionService subsectionService) {
    this.subsectionService = subsectionService;
  }

  @GetMapping
  public ResponseEntity<SubsectionListResponseDto> getAllSubsections(
      @RequestParam(defaultValue = "0") int pageNumber,
      @RequestParam(defaultValue = "10") int pageSize,
      @RequestParam(defaultValue = "id") String sortBy,
      @RequestParam(defaultValue = "asc") String sortDir) {
    logger.info(
        "Getting all subsections with pagination: page={}, size={}, sortBy={}, sortDir={}",
        pageNumber,
        pageSize,
        sortBy,
        sortDir);

    int[] validatedParams = PaginationSortingUtil.validatePaginationParams(pageNumber, pageSize);

    SubsectionListResponseDto subsections =
        subsectionService.getAll(validatedParams[0], validatedParams[1], sortBy, sortDir);

    return ResponseEntity.ok(subsections);
  }

  @GetMapping("/{id}")
  @PreAuthorize("@subsectionSecurityService.canAccess(#id)")
  public ResponseEntity<SubsectionResponseDto> getSubsectionById(@PathVariable UUID id) {
    logger.info("Getting subsection by id: {}", id);
    SubsectionResponseDto subsection = subsectionService.get(id);
    return ResponseEntity.ok(subsection);
  }

  @PostMapping
  public ResponseEntity<SubsectionResponseDto> createSubsection(
      @Valid @RequestBody SubsectionCreateRequestDto subsection) {
    logger.info("Creating subsection with title: '{}'", subsection.getTitle());
    SubsectionResponseDto createdSubsection = subsectionService.create(subsection);
    return ResponseEntity.status(HttpStatus.CREATED).body(createdSubsection);
  }

  @PutMapping("/{id}")
  @PreAuthorize("@subsectionSecurityService.canModify(#id)")
  public ResponseEntity<SubsectionResponseDto> updateSubsection(
      @PathVariable UUID id, @Valid @RequestBody SubsectionUpdateRequestDto subsection) {
    logger.info("Updating subsection with id: {}", id);
    SubsectionResponseDto updatedSubsection = subsectionService.update(subsection, id);
    return ResponseEntity.ok(updatedSubsection);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("@subsectionSecurityService.canModify(#id)")
  public ResponseEntity<BaseResponseDto> deleteSubsection(@PathVariable UUID id) {
    logger.info("Deleting subsection with id: {}", id);
    BaseResponseDto deletedSubsection = subsectionService.delete(id);
    return ResponseEntity.ok(deletedSubsection);
  }
}
