package com.devs.roamance.service.impl;

import java.util.List;
import java.util.UUID;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.devs.roamance.constant.ResponseMessage;
import com.devs.roamance.dto.SubsectionDto;
import com.devs.roamance.dto.request.travel.journal.ActivitySubsectionCreateRequestDto;
import com.devs.roamance.dto.request.travel.journal.ActivitySubsectionUpdateRequestDto;
import com.devs.roamance.dto.request.travel.journal.RouteSubsectionCreateRequestDto;
import com.devs.roamance.dto.request.travel.journal.RouteSubsectionUpdateRequestDto;
import com.devs.roamance.dto.request.travel.journal.SightseeingSubsectionCreateRequestDto;
import com.devs.roamance.dto.request.travel.journal.SightseeingSubsectionUpdateRequestDto;
import com.devs.roamance.dto.request.travel.journal.SubsectionCreateRequestDto;
import com.devs.roamance.dto.request.travel.journal.SubsectionUpdateRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.travel.journal.SubsectionListResponseDto;
import com.devs.roamance.dto.response.travel.journal.SubsectionResponseDto;
import com.devs.roamance.exception.JournalNotFoundException;
import com.devs.roamance.exception.SubsectionNotFoundException;
import com.devs.roamance.model.Location;
import com.devs.roamance.model.travel.journal.ActivitySubsection;
import com.devs.roamance.model.travel.journal.Journal;
import com.devs.roamance.model.travel.journal.RouteSubsection;
import com.devs.roamance.model.travel.journal.SightseeingSubsection;
import com.devs.roamance.model.travel.journal.Subsection;
import com.devs.roamance.model.travel.journal.SubsectionType;
import com.devs.roamance.repository.JournalRepository;
import com.devs.roamance.repository.SubsectionRepository;
import com.devs.roamance.service.SubsectionService;

@Service
public class SubsectionServiceImpl implements SubsectionService {
  private static final Logger logger = LoggerFactory.getLogger(SubsectionServiceImpl.class);

  private final SubsectionRepository subsectionRepository;
  private final JournalRepository journalRepository;
  private final ModelMapper modelMapper;

  public SubsectionServiceImpl(
      SubsectionRepository subsectionRepository,
      JournalRepository journalRepository,
      ModelMapper modelMapper) {
    this.subsectionRepository = subsectionRepository;
    this.journalRepository = journalRepository;
    this.modelMapper = modelMapper;
  }

  @Override
  public SubsectionResponseDto create(SubsectionCreateRequestDto requestDto) {
    logger.info("Creating subsection with title: '{}'", requestDto.getTitle());

    Subsection subsection = mapToSubsectionType(requestDto);
    Subsection savedSubsection = subsectionRepository.save(subsection);

    return new SubsectionResponseDto(
        201, true, ResponseMessage.SUBSECTION_CREATE_SUCCESS, savedSubsection);
  }

  @Override
  public SubsectionListResponseDto getAll() {
    List<Subsection> subsections = subsectionRepository.findAll();
    List<SubsectionDto> subsectionDtos = subsections.stream()
        .map(subsection -> modelMapper.map(subsection, SubsectionDto.class)).toList();

    return new SubsectionListResponseDto(
        200, true, ResponseMessage.SUBSECTIONS_FETCH_SUCCESS, subsectionDtos);
  }

  @Override
  public SubsectionResponseDto getById(UUID id) {
    logger.info("Fetching subsection with id: {}", id);
    Subsection subsection = subsectionRepository
        .findById(id)
        .orElseThrow(
            () -> new SubsectionNotFoundException(
                String.format(ResponseMessage.SUBSECTION_NOT_FOUND, id)));

    logger.info("Successfully fetched subsection with title: '{}'", subsection.getTitle());
    return new SubsectionResponseDto(200, true, ResponseMessage.SUBSECTION_FETCH_SUCCESS, subsection);
  }

  @Override
  public SubsectionResponseDto update(SubsectionUpdateRequestDto subsectionDetails, UUID id) {
    Subsection subsection = subsectionRepository
        .findById(id)
        .orElseThrow(
            () -> new SubsectionNotFoundException(
                String.format(ResponseMessage.SUBSECTION_NOT_FOUND, id)));

    subsection.setTitle(subsectionDetails.getTitle());

    // Handle specific subsection type updates based on the class
    updateSpecificFields(subsection, subsectionDetails);

    Subsection savedSubsection = subsectionRepository.save(subsection);

    return new SubsectionResponseDto(200, true, ResponseMessage.SUBSECTION_UPDATE_SUCCESS, savedSubsection);
  }

  @Override
  public BaseResponseDto delete(UUID id) {
    Subsection subsection = getById(id).getData();

    subsectionRepository.delete(subsection);

    return new BaseResponseDto(200, true, ResponseMessage.SUBSECTION_DELETE_SUCCESS);
  }

  @Override
  public SubsectionListResponseDto getByJournalId(UUID journalId) {
    logger.info("Fetching subsections for journal with id: {}", journalId);

    Journal journal = journalRepository
        .findByIdWithSubsections(journalId)
        .orElseThrow(
            () -> new JournalNotFoundException(
                String.format(ResponseMessage.JOURNAL_NOT_FOUND, journalId)));

    List<Subsection> subsections = journal.getSubsections();
    List<SubsectionDto> subsectionDtos = subsections.stream()
        .map(subsection -> modelMapper.map(subsection, SubsectionDto.class)).toList();

    logger.info("Found {} subsections for journal with id: {}", subsections.size(), journalId);

    return new SubsectionListResponseDto(
        200, true, ResponseMessage.SUBSECTIONS_FETCH_SUCCESS, subsectionDtos);
  }

  @Override
  public SubsectionResponseDto addToJournal(UUID journalId, SubsectionCreateRequestDto subsectionDto) {
    logger.info("Adding subsection to journal with id: {}", journalId);

    Journal journal = journalRepository
        .findByIdWithSubsections(journalId)
        .orElseThrow(
            () -> new JournalNotFoundException(
                String.format(ResponseMessage.JOURNAL_NOT_FOUND, journalId)));

    Subsection subsection = mapToSubsectionType(subsectionDto);
    subsection.setJournal(journal);

    Subsection savedSubsection = subsectionRepository.save(subsection);
    journal.addSubsection(savedSubsection);
    journalRepository.save(journal);

    logger.info("Successfully added subsection to journal with id: {}", journalId);

    return new SubsectionResponseDto(201, true, ResponseMessage.SUBSECTION_ADD_SUCCESS, savedSubsection);
  }

  @Override
  public BaseResponseDto removeFromJournal(UUID journalId, UUID subsectionId) {
    logger.info("Removing subsection with id: {} from journal with id: {}", subsectionId, journalId);

    Journal journal = journalRepository
        .findByIdWithSubsections(journalId)
        .orElseThrow(
            () -> new JournalNotFoundException(
                String.format(ResponseMessage.JOURNAL_NOT_FOUND, journalId)));

    Subsection subsection = subsectionRepository
        .findById(subsectionId)
        .orElseThrow(
            () -> new SubsectionNotFoundException(
                String.format(ResponseMessage.SUBSECTION_NOT_FOUND, subsectionId)));

    journal.removeSubsection(subsection);
    journalRepository.save(journal);
    subsectionRepository.delete(subsection);

    logger.info("Successfully removed subsection from journal");

    return new BaseResponseDto(200, true, ResponseMessage.SUBSECTION_REMOVE_SUCCESS);
  }

  private Subsection mapToSubsectionType(SubsectionCreateRequestDto subsectionDto) {
    return switch (subsectionDto) {
      case ActivitySubsectionCreateRequestDto activityDto ->
        modelMapper.map(subsectionDto, ActivitySubsection.class);
      case SightseeingSubsectionCreateRequestDto sightseeingDto ->
        modelMapper.map(subsectionDto, SightseeingSubsection.class);
      case RouteSubsectionCreateRequestDto routeDto ->
        modelMapper.map(subsectionDto, RouteSubsection.class);
      case null, default ->
        throw new IllegalArgumentException(
            "Unknown subsection type: " + subsectionDto.getClass().getName());
    };
  }

  private void updateSpecificFields(Subsection subsection, SubsectionUpdateRequestDto subsectionDetails) {
    if (subsection instanceof ActivitySubsection activitySubsection
        && subsectionDetails instanceof ActivitySubsectionUpdateRequestDto activityDetails) {

      activitySubsection.setActivityName(activityDetails.getActivityName());
      if (activityDetails.getLocation() != null) {
        activitySubsection.setLocation(modelMapper.map(activityDetails.getLocation(), Location.class));
      }
    } else if (subsection instanceof SightseeingSubsection sightseeingSubsection
        && subsectionDetails instanceof SightseeingSubsectionUpdateRequestDto sightseeingDetails) {

      if (sightseeingDetails.getLocation() != null) {
        sightseeingSubsection.setLocation(modelMapper.map(sightseeingDetails.getLocation(), Location.class));
      }
    } else if (subsection instanceof RouteSubsection routeSubsection
        && subsectionDetails.getType() == SubsectionType.ROUTE) {

      try {
        RouteSubsectionUpdateRequestDto routeDetails = modelMapper.map(subsectionDetails, RouteSubsectionUpdateRequestDto.class);
        routeSubsection.setTotalTime(routeDetails.getTotalTime());
        routeSubsection.setTotalDistance(routeDetails.getTotalDistance());
        if (routeDetails.getLocations() != null && !routeDetails.getLocations().isEmpty()) {
          List<Location> locations = routeDetails.getLocations().stream()
              .map(loc -> modelMapper.map(loc, Location.class))
              .toList();
          routeSubsection.setLocations(locations);
        }
      } catch (Exception e) {
        logger.error("Error mapping subsection details to RouteSubsectionUpdateRequestDto", e);
      }
    }
  }
}
