package com.devs.roamance.service.impl;

import com.devs.roamance.constant.ResponseMessage;
import com.devs.roamance.dto.JournalDto;
import com.devs.roamance.dto.request.travel.journal.*;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.travel.journal.JournalListResponseDto;
import com.devs.roamance.dto.response.travel.journal.JournalResponseDto;
import com.devs.roamance.exception.JournalAlreadyExistException;
import com.devs.roamance.exception.JournalNotFoundException;
import com.devs.roamance.model.Location;
import com.devs.roamance.model.User;
import com.devs.roamance.model.travel.journal.*;
import com.devs.roamance.repository.JournalRepository;
import com.devs.roamance.repository.UserRepository;
import com.devs.roamance.service.JournalService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class JournalServiceImpl implements JournalService {
  private static final Logger logger = LoggerFactory.getLogger(JournalServiceImpl.class);

  private final JournalRepository journalRepository;
  private final UserRepository userRepository;
  private final ModelMapper modelMapper;

  public JournalServiceImpl(
      JournalRepository journalRepository, UserRepository userService, ModelMapper modelMapper) {
    this.journalRepository = journalRepository;
    this.userRepository = userService;
    this.modelMapper = modelMapper;
  }

  @Override
  public JournalResponseDto create(JournalCreateRequestDto requestDto) {
    try {
      logger.info(
          "Creating journal with title: '{}' and {} subsections",
          requestDto.getTitle(),
          requestDto.getSubsections().size());

      Journal journal = modelMapper.map(requestDto, Journal.class);

      logger.info("Creating journal with title: '{}'", journal);

      if (!requestDto.getSubsections().isEmpty()) {
        for (SubsectionCreateRequestDto subsectionDto : requestDto.getSubsections()) {
          Subsection subsection =
              switch (subsectionDto) {
                case ActivitySubsectionCreateRequestDto activitySubsectionCreateRequestDto ->
                    modelMapper.map(subsectionDto, ActivitySubsection.class);
                case SightseeingSubsectionCreateRequestDto sightseeingSubsectionCreateRequestDto ->
                    modelMapper.map(subsectionDto, SightseeingSubsection.class);
                case RouteSubsectionCreateRequestDto routeSubsectionCreateRequestDto ->
                    modelMapper.map(subsectionDto, RouteSubsection.class);
                case null, default ->
                    throw new IllegalArgumentException(
                        "Unknown subsection type: " + subsectionDto.getClass().getName());
              };
          journal.addSubsection(subsection);
        }
        logger.info(
            "Established bidirectional relationship for {} subsections",
            journal.getSubsections().size());
      }

      Journal savedJournal = journalRepository.save(journal);

      Journal dto =
          journalRepository
              .findByIdWithSubsections(savedJournal.getId())
              .orElseThrow(
                  () ->
                      new JournalNotFoundException(
                          String.format(ResponseMessage.JOURNAL_NOT_FOUND, savedJournal.getId())));

      return new JournalResponseDto(201, true, ResponseMessage.JOURNAL_CREATE_SUCCESS, dto);

    } catch (DataIntegrityViolationException e) {
      throw new JournalAlreadyExistException(
          String.format(ResponseMessage.JOURNAL_ALREADY_EXIST, requestDto.getTitle()));
    }
  }

  @Override
  public JournalListResponseDto getAll() {
    List<Journal> journals = journalRepository.findAllWithSubsections();
    List<JournalDto> journalDtos =
        journals.stream()
            .map(
                journal -> {
                  JournalDto dto = modelMapper.map(journal, JournalDto.class);
                  dto.setTotalSubsections(journal.getSubsections().size());
                  return dto;
                })
            .toList();

    return new JournalListResponseDto(
        200, true, ResponseMessage.JOURNALS_FETCH_SUCCESS, journalDtos);
  }

  @Override
  public JournalResponseDto getById(UUID id) {
    logger.info("Fetching journal with id: {} using JOIN FETCH for subsections", id);
    Journal journal =
        journalRepository
            .findByIdWithSubsections(id)
            .orElseThrow(
                () ->
                    new JournalNotFoundException(
                        String.format(ResponseMessage.JOURNAL_NOT_FOUND, id)));
    logger.info(
        "Successfully fetched journal with title: '{}' and {} subsections",
        journal.getTitle(),
        journal.getSubsections().size());
    return new JournalResponseDto(200, true, ResponseMessage.JOURNAL_FETCH_SUCCESS, journal);
  }

  @Override
  public JournalResponseDto update(JournalUpdateRequestDto journalDetails, UUID id) {
    Journal journal =
        journalRepository
            .findByIdWithSubsections(id)
            .orElseThrow(
                () ->
                    new JournalNotFoundException(
                        String.format(ResponseMessage.JOURNAL_NOT_FOUND, id)));

    journal.setTitle(journalDetails.getTitle());
    journal.setDescription(journalDetails.getDescription());

    if (journalDetails.getDestination() != null) {
      journal.setDestination(modelMapper.map(journalDetails.getDestination(), Location.class));
    }

    Journal savedJournal = journalRepository.save(journal);

    Journal dto =
        journalRepository
            .findByIdWithSubsections(savedJournal.getId())
            .orElseThrow(
                () ->
                    new JournalNotFoundException(
                        String.format(ResponseMessage.JOURNAL_NOT_FOUND, savedJournal.getId())));

    return new JournalResponseDto(200, true, ResponseMessage.JOURNAL_UPDATE_SUCCESS, dto);
  }

  @Override
  public BaseResponseDto delete(UUID id) {
    Journal journal = getById(id).getData();

    journalRepository.delete(journal);

    return new BaseResponseDto(200, true, ResponseMessage.JOURNAL_DELETE_SUCCESS);
  }

  @Override
  public JournalListResponseDto getByUserRole() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    boolean isAdmin =
        authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));

    if (isAdmin) {
      logger.info("User has ADMIN role, returning all journals");
      List<Journal> journals = journalRepository.findAllWithSubsections();
      List<JournalDto> journalDtos =
          journals.stream()
              .map(
                  journal -> {
                    JournalDto dto = modelMapper.map(journal, JournalDto.class);
                    dto.setTotalSubsections(journal.getSubsections().size());
                    return dto;
                  })
              .toList();
      return new JournalListResponseDto(
          200, true, ResponseMessage.JOURNALS_FETCH_SUCCESS, journalDtos);
    } else {
      String email = authentication.getName();
      Optional<UUID> userId = userRepository.findByEmail(email).map(User::getId);

      logger.info("User has USER role, returning only their journals, userId: {}", userId);

      if (userId.isPresent()) {
        List<Journal> journals = journalRepository.findByCreatedByWithSubsections(userId.get());
        List<JournalDto> journalDtos =
            journals.stream()
                .map(
                    journal -> {
                      JournalDto dto = modelMapper.map(journal, JournalDto.class);
                      dto.setTotalSubsections(journal.getSubsections().size());
                      return dto;
                    })
                .toList();
        return new JournalListResponseDto(
            200, true, ResponseMessage.JOURNALS_FETCH_SUCCESS, journalDtos);
      } else {
        return new JournalListResponseDto(
            200, true, ResponseMessage.JOURNALS_FETCH_SUCCESS, List.of());
      }
    }
  }
}
