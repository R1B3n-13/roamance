package com.devs.roamance.service.impl;

import com.devs.roamance.constant.ResponseMessage;
import com.devs.roamance.dto.JournalDto;
import com.devs.roamance.dto.request.travel.journal.JournalCreateRequestDto;
import com.devs.roamance.dto.request.travel.journal.JournalUpdateRequestDto;
import com.devs.roamance.dto.request.travel.journal.SubsectionCreateRequestDto;
import com.devs.roamance.dto.response.travel.journal.JournalListResponseDto;
import com.devs.roamance.dto.response.travel.journal.JournalResponseDto;
import com.devs.roamance.exception.JournalAlreadyExistException;
import com.devs.roamance.model.Location;
import com.devs.roamance.model.User;
import com.devs.roamance.model.travel.journal.Journal;
import com.devs.roamance.model.travel.journal.Subsection;
import com.devs.roamance.repository.JournalRepository;
import com.devs.roamance.repository.UserRepository;
import com.devs.roamance.service.JournalService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

  @Autowired
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

      logger.info("Creating journal with title: '{}'", journal.toString());

      if (!requestDto.getSubsections().isEmpty()) {
        for (SubsectionCreateRequestDto subsectionDto : requestDto.getSubsections()) {
          Subsection subsection = modelMapper.map(subsectionDto, Subsection.class);
          subsection.setJournal(journal);
        }
        logger.info(
            "Established bidirectional relationship for {} subsections",
            journal.getSubsections().size());
      }

      Journal dto = journalRepository.save(journal);

      return new JournalResponseDto(201, true, ResponseMessage.JOURNAL_CREATE_SUCCESS, dto);

    } catch (DataIntegrityViolationException e) {
      throw new JournalAlreadyExistException(
          String.format(ResponseMessage.JOURNAL_ALREADY_EXIST, requestDto.getTitle()));
    }
  }

  @Override
  public JournalListResponseDto getAll() {

    List<Journal> journals = journalRepository.findAll();

    List<JournalDto> dto =
        journals.stream().map(journal -> modelMapper.map(journal, JournalDto.class)).toList();

    return new JournalListResponseDto(200, true, ResponseMessage.JOURNALS_FETCH_SUCCESS, dto);
  }

  @Override
  public JournalResponseDto getById(UUID id) {
    logger.info("Fetching journal with id: {} using JOIN FETCH for subsections", id);
    Journal journal =
        journalRepository
            .findByIdWithSubsections(id)
            .orElseThrow(() -> new RuntimeException("Journal not found"));
    logger.info(
        "Successfully fetched journal with title: '{}' and {} subsections",
        journal.getTitle(),
        journal.getSubsections().size());
    return new JournalResponseDto(200, true, ResponseMessage.JOURNAL_FETCH_SUCCESS, journal);
  }

  @Override
  public JournalResponseDto update(JournalUpdateRequestDto journalDetails, UUID id) {
    Journal journal = modelMapper.map(getById(id), Journal.class);
    journal.setTitle(journalDetails.getTitle());
    journal.setDescription(journalDetails.getDescription());

    if (journalDetails.getDestination() != null) {
      journal.setDestination(modelMapper.map(journalDetails.getDestination(), Location.class));
    }

    Journal dto = journalRepository.save(journal);
    return new JournalResponseDto(200, true, ResponseMessage.JOURNAL_UPDATE_SUCCESS, dto);
  }

  @Override
  public JournalResponseDto delete(UUID id) {
    Journal journal = getById(id).getData();
    journalRepository.delete(journal);
    return new JournalResponseDto(200, true, ResponseMessage.JOURNAL_DELETE_SUCCESS, journal);
  }

  @Override
  public JournalListResponseDto getByUserRole() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    boolean isAdmin =
        authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));

    if (isAdmin) {
      logger.info("User has ADMIN role, returning all journals");
      List<JournalDto> journals =
          journalRepository.findAll().stream()
              .map(journal -> modelMapper.map(journal, JournalDto.class))
              .toList();
      return new JournalListResponseDto(
          200, true, ResponseMessage.JOURNALS_FETCH_SUCCESS, journals);
    } else {
      String email = authentication.getName();
      Optional<UUID> userId = userRepository.findByEmail(email).map(User::getId);

      logger.info("User has USER role, returning only their journals, userId: {}", userId);

      List<JournalDto> journals =
          journalRepository.findByCreatedBy(userId).stream()
              .map(journal -> modelMapper.map(journal, JournalDto.class))
              .toList();
      return new JournalListResponseDto(
          200, true, ResponseMessage.JOURNALS_FETCH_SUCCESS, journals);
    }
  }
}
