package com.devs.roamance.controller;

import com.devs.roamance.dto.request.travel.journal.SubsectionCreateRequestDto;
import com.devs.roamance.dto.request.travel.journal.SubsectionUpdateRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.travel.journal.SubsectionListResponseDto;
import com.devs.roamance.dto.response.travel.journal.SubsectionResponseDto;
import com.devs.roamance.service.SubsectionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/subsections")
public class SubsectionController {

  private static final Logger logger = LoggerFactory.getLogger(SubsectionController.class);
  private final SubsectionService subsectionService;

  public SubsectionController(SubsectionService subsectionService) {
    this.subsectionService = subsectionService;
  }

  @GetMapping
  public ResponseEntity<SubsectionListResponseDto> getAllSubsections() {
    logger.info("Getting all subsections");
    SubsectionListResponseDto subsections = subsectionService.getAll();
    return ResponseEntity.ok(subsections);
  }

  @GetMapping("/{id}")
  public ResponseEntity<SubsectionResponseDto> getSubsectionById(@PathVariable UUID id) {
    logger.info("Getting subsection by id: {}", id);
    SubsectionResponseDto subsection = subsectionService.getById(id);
    return ResponseEntity.ok(subsection);
  }

  @PostMapping
  public ResponseEntity<SubsectionResponseDto> createSubsection(
      @RequestBody SubsectionCreateRequestDto subsection) {
    logger.info("Creating subsection with title: '{}'", subsection.getTitle());
    SubsectionResponseDto createdSubsection = subsectionService.create(subsection);
    return ResponseEntity.status(HttpStatus.CREATED).body(createdSubsection);
  }

  @PutMapping("/{id}")
  public ResponseEntity<SubsectionResponseDto> updateSubsection(
      @PathVariable UUID id, @RequestBody SubsectionUpdateRequestDto subsection) {
    logger.info("Updating subsection with id: {}", id);
    SubsectionResponseDto updatedSubsection = subsectionService.update(subsection, id);
    return ResponseEntity.ok(updatedSubsection);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<BaseResponseDto> deleteSubsection(@PathVariable UUID id) {
    logger.info("Deleting subsection with id: {}", id);
    BaseResponseDto deletedSubsection = subsectionService.delete(id);
    return ResponseEntity.ok(deletedSubsection);
  }
}
