package com.devs.roamance.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devs.roamance.constant.ResponseMessage;
import com.devs.roamance.dto.request.user.UserPreferenceRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.user.UserPreferenceDto;
import com.devs.roamance.dto.response.user.UserPreferenceListResponseDto;
import com.devs.roamance.dto.response.user.UserPreferenceResponseDto;
import com.devs.roamance.exception.ResourceNotFoundException;
import com.devs.roamance.exception.UnauthorizedAccessException;
import com.devs.roamance.exception.UserAlreadyExistException;
import com.devs.roamance.model.user.User;
import com.devs.roamance.model.user.UserPreference;
import com.devs.roamance.repository.UserPreferenceRepository;
import com.devs.roamance.repository.UserRepository;
import com.devs.roamance.service.UserPreferenceService;
import com.devs.roamance.util.UserUtil;

@Service
public class UserPreferenceServiceImpl implements UserPreferenceService {

    private final UserPreferenceRepository preferenceRepository;
    private final UserUtil userUtil;
    private final ModelMapper modelMapper;

    public UserPreferenceServiceImpl(
            UserPreferenceRepository preferenceRepository,
            UserRepository userRepository,
            UserUtil userUtil,
            ModelMapper modelMapper) {
        this.preferenceRepository = preferenceRepository;
        this.userUtil = userUtil;
        this.modelMapper = modelMapper;
    }

    @Override
    @Transactional
    public UserPreferenceResponseDto create(UserPreferenceRequestDto createRequestDto) {
        User currentUser = userUtil.getAuthenticatedUser();

        preferenceRepository.findByUserId(currentUser.getId()).ifPresent(existingPreference -> {
            throw new UserAlreadyExistException("User preferences already exist. Use the update endpoint instead.");
        });

        UserPreference preference = new UserPreference();
        preference.setUser(currentUser);
        preference.setPhone(createRequestDto.getPhone());
        preference.setBio(createRequestDto.getBio());
        preference.setLocation(createRequestDto.getLocation());
        preference.setWebsite(createRequestDto.getWebsite());
        preference.setBirthday(createRequestDto.getBirthday());

        UserPreference savedPreference = preferenceRepository.save(preference);
        UserPreferenceDto dto = mapToDto(savedPreference);

        return new UserPreferenceResponseDto(201, true, ResponseMessage.USER_PREFERENCE_CREATE_SUCCESS, dto);
    }

    @Override
    public UserPreferenceListResponseDto getAll(int pageNumber, int pageSize, String sortBy, String sortDir) {
        User currentUser = userUtil.getAuthenticatedUser();
        boolean isAdmin = isAdmin(currentUser);

        List<UserPreference> preferences;
        Page<UserPreference> preferencesPage;

        if (isAdmin) {
            Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();

            Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
            preferencesPage = preferenceRepository.findAll(pageable);
            preferences = preferencesPage.getContent();
        } else {
            preferences = preferenceRepository.findByUserId(currentUser.getId())
                    .map(List::of)
                    .orElse(List.of());
        }

        List<UserPreferenceDto> preferenceDtos = preferences.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new UserPreferenceListResponseDto(
                200,
                true,
                ResponseMessage.USER_PREFERENCE_FETCH_SUCCESS,
                preferenceDtos);
    }

    @Override
    public UserPreferenceResponseDto get(UUID id) {
        UserPreference preference = findPreferenceById(id);

        User currentUser = userUtil.getAuthenticatedUser();
        if (!preference.getUser().getId().equals(currentUser.getId()) && !isAdmin(currentUser)) {
            throw new UnauthorizedAccessException("You don't have permission to access this preference");
        }

        UserPreferenceDto dto = mapToDto(preference);
        return new UserPreferenceResponseDto(
                200, true, ResponseMessage.USER_PREFERENCE_FETCH_SUCCESS, dto);
    }

    @Override
    public UserPreferenceResponseDto getByUserId(UUID id) {
        User currentUser = userUtil.getAuthenticatedUser();
        boolean isAdmin = isAdmin(currentUser);

        if (!currentUser.getId().equals(id) && !isAdmin) {
            throw new UnauthorizedAccessException("You don't have permission to access this user's preferences");
        }

        UserPreference preference = findPreferenceByUserId(id);

        UserPreferenceDto dto = mapToDto(preference);
        return new UserPreferenceResponseDto(
                200, true, ResponseMessage.USER_PREFERENCE_FETCH_SUCCESS, dto);
    }

    @Override
    @Transactional
    public UserPreferenceResponseDto update(UserPreferenceRequestDto updateRequestDto, UUID id) {
        UserPreference preference = findPreferenceById(id);

        User currentUser = userUtil.getAuthenticatedUser();
        if (!preference.getUser().getId().equals(currentUser.getId()) && !isAdmin(currentUser)) {
            throw new UnauthorizedAccessException("You don't have permission to update this preference");
        }

        preference.setPhone(updateRequestDto.getPhone());
        preference.setBio(updateRequestDto.getBio());
        preference.setLocation(updateRequestDto.getLocation());
        preference.setWebsite(updateRequestDto.getWebsite());
        preference.setBirthday(updateRequestDto.getBirthday());

        UserPreference savedPreference = preferenceRepository.save(preference);
        UserPreferenceDto dto = mapToDto(savedPreference);

        return new UserPreferenceResponseDto(200, true, ResponseMessage.USER_PREFERENCE_UPDATE_SUCCESS, dto);
    }

    @Override
    @Transactional
    public BaseResponseDto delete(UUID id) {
        UserPreference preference = findPreferenceById(id);

        User currentUser = userUtil.getAuthenticatedUser();
        if (!preference.getUser().getId().equals(currentUser.getId()) && !isAdmin(currentUser)) {
            throw new UnauthorizedAccessException("You don't have permission to delete this preference");
        }

        preferenceRepository.delete(preference);
        return new BaseResponseDto(200, true, ResponseMessage.USER_PREFERENCE_DELETE_SUCCESS);
    }

    @Override
    @Transactional
    public UserPreferenceResponseDto updateByUserId(UserPreferenceRequestDto updateRequestDto, UUID userId) {
        UserPreference preference = findPreferenceByUserId(userId);
        return update(updateRequestDto, preference.getId());
    }

    @Override
    @Transactional
    public BaseResponseDto deleteByUserId(UUID userId) {
        UserPreference preference = findPreferenceByUserId(userId);
        return delete(preference.getId());
    }

    private UserPreferenceDto mapToDto(UserPreference preference) {
        UserPreferenceDto dto = modelMapper.map(preference, UserPreferenceDto.class);
        dto.setUserId(preference.getUser().getId());
        return dto;
    }

    private UserPreference findPreferenceById(UUID id) {
        return preferenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("No preference found with id: %s", id)));
    }

    private UserPreference findPreferenceByUserId(UUID userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("No preferences found for user with id: %s", userId)));
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream().anyMatch(r -> r.name().equals("ADMIN"));
    }
}
