package com.devs.roamance.service.impl;

import com.devs.roamance.constant.ResponseMessage;
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
import java.util.List;
import java.util.UUID;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

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
    logger.info(
        "Creating subsection with title: '{}' for journal with ID: {}",
        requestDto.getTitle(),
        requestDto.getJournalId());

    // Find the journal
    Journal journal =
        journalRepository
            .findById(requestDto.getJournalId())
            .orElseThrow(
                () ->
                    new JournalNotFoundException(
                        String.format(
                            ResponseMessage.JOURNAL_NOT_FOUND, requestDto.getJournalId())));

    // Create the subsection and link it to the journal
    Subsection subsection = mapToSubsectionType(requestDto);
    subsection.setJournal(journal);

    Subsection savedSubsection = subsectionRepository.save(subsection);

    logger.info(
        "Successfully created subsection with ID: {} linked to journal: {}",
        savedSubsection.getId(),
        journal.getTitle());

    return new SubsectionResponseDto(
        201, true, ResponseMessage.SUBSECTION_CREATE_SUCCESS, savedSubsection);
  }

  @Override
  public SubsectionListResponseDto getAll() {
    logger.info("Fetching all subsections");
    List<Subsection> subsections = subsectionRepository.findAll();

    logger.info("Successfully fetched {} subsections", subsections.size());
    return new SubsectionListResponseDto(
        200, true, ResponseMessage.SUBSECTIONS_FETCH_SUCCESS, subsections);
  }

  @Override
  public SubsectionResponseDto getById(UUID id) {
    logger.info("Fetching subsection with id: {}", id);
    Subsection subsection =
        subsectionRepository
            .findById(id)
            .orElseThrow(
                () ->
                    new SubsectionNotFoundException(
                        String.format(ResponseMessage.SUBSECTION_NOT_FOUND, id)));

    logger.info("Successfully fetched subsection with title: '{}'", subsection.getTitle());
    return new SubsectionResponseDto(
        200, true, ResponseMessage.SUBSECTION_FETCH_SUCCESS, subsection);
  }

  @Override
  public SubsectionResponseDto update(SubsectionUpdateRequestDto subsectionDetails, UUID id) {
    Subsection subsection =
        subsectionRepository
            .findById(id)
            .orElseThrow(
                () ->
                    new SubsectionNotFoundException(
                        String.format(ResponseMessage.SUBSECTION_NOT_FOUND, id)));

    subsection.setTitle(subsectionDetails.getTitle());

    updateSpecificFields(subsection, subsectionDetails);

    Subsection savedSubsection = subsectionRepository.save(subsection);

    return new SubsectionResponseDto(
        200, true, ResponseMessage.SUBSECTION_UPDATE_SUCCESS, savedSubsection);
  }

  @Override
  public BaseResponseDto delete(UUID id) {
    logger.info("Deleting subsection with id: {}", id);

    // Fetch subsection with its journal
    Subsection subsection = getById(id).getData();
    Journal journal = subsection.getJournal();

    if (journal != null) {
      logger.info("Detaching subsection from journal with ID: {}", journal.getId());
      // Detach subsection from journal using the helper method in Journal
      journal.removeSubsection(subsection);
      subsection.setJournal(null);
    }

    // Delete the subsection
    subsectionRepository.delete(subsection);

    logger.info("Successfully deleted subsection with id: {}", id);
    return new BaseResponseDto(200, true, ResponseMessage.SUBSECTION_DELETE_SUCCESS);
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

  private void updateSpecificFields(
      Subsection subsection, SubsectionUpdateRequestDto subsectionDetails) {
    if (subsection instanceof ActivitySubsection activitySubsection
        && subsectionDetails instanceof ActivitySubsectionUpdateRequestDto activityDetails) {

      activitySubsection.setActivityName(activityDetails.getActivityName());
      if (activityDetails.getLocation() != null) {
        activitySubsection.setLocation(
            modelMapper.map(activityDetails.getLocation(), Location.class));
      }
    } else if (subsection instanceof SightseeingSubsection sightseeingSubsection
        && subsectionDetails instanceof SightseeingSubsectionUpdateRequestDto sightseeingDetails) {

      if (sightseeingDetails.getLocation() != null) {
        sightseeingSubsection.setLocation(
            modelMapper.map(sightseeingDetails.getLocation(), Location.class));
      }
    } else if (subsection instanceof RouteSubsection routeSubsection
        && subsectionDetails.getType() == SubsectionType.ROUTE) {

      try {
        RouteSubsectionUpdateRequestDto routeDetails =
            modelMapper.map(subsectionDetails, RouteSubsectionUpdateRequestDto.class);
        routeSubsection.setTotalTime(routeDetails.getTotalTime());
        routeSubsection.setTotalDistance(routeDetails.getTotalDistance());
        if (routeDetails.getLocations() != null && !routeDetails.getLocations().isEmpty()) {
          List<Location> locations =
              routeDetails.getLocations().stream()
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
