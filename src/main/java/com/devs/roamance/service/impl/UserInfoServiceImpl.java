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
import com.devs.roamance.model.user.UserInfo;
import com.devs.roamance.repository.UserInfoRepository;
import com.devs.roamance.repository.UserRepository;
import com.devs.roamance.service.UserInfoService;
import com.devs.roamance.util.UserUtil;

@Service
public class UserInfoServiceImpl implements UserInfoService {

    private final UserInfoRepository userInfoRepository;
    private final UserUtil userUtil;
    private final ModelMapper modelMapper;

    public UserInfoServiceImpl(
            UserInfoRepository userInfoRepository,
            UserRepository userRepository,
            UserUtil userUtil,
            ModelMapper modelMapper) {
        this.userInfoRepository = userInfoRepository;
        this.userUtil = userUtil;
        this.modelMapper = modelMapper;
    }

    @Override
    @Transactional
    public UserPreferenceResponseDto create(UserPreferenceRequestDto createRequestDto) {
        User currentUser = userUtil.getAuthenticatedUser();

        userInfoRepository.findByUserId(currentUser.getId()).ifPresent(existingPreference -> {
            throw new UserAlreadyExistException("User's information already exist. Use the update endpoint instead.");
        });

        UserInfo userInfo = new UserInfo();
        userInfo.setUser(currentUser);
        userInfo.setPhone(createRequestDto.getPhone());
        userInfo.setBio(createRequestDto.getBio());
        userInfo.setLocation(createRequestDto.getLocation());
        userInfo.setWebsite(createRequestDto.getWebsite());
        userInfo.setBirthday(createRequestDto.getBirthday());
        userInfo.setProfileImage(createRequestDto.getProfile_image());
        userInfo.setCoverImage(createRequestDto.getCover_image());

        UserInfo savedPreference = userInfoRepository.save(userInfo);
        UserPreferenceDto dto = mapToDto(savedPreference);

        return new UserPreferenceResponseDto(201, true, ResponseMessage.USER_INFO_CREATE_SUCCESS, dto);
    }

    @Override
    public UserPreferenceListResponseDto getAll(int pageNumber, int pageSize, String sortBy, String sortDir) {
        User currentUser = userUtil.getAuthenticatedUser();
        boolean isAdmin = isAdmin(currentUser);

        List<UserInfo> info;
        Page<UserInfo> userInfoPage;

        if (isAdmin) {
            Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();

            Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
            userInfoPage = userInfoRepository.findAll(pageable);
            info = userInfoPage.getContent();
        } else {
            info = userInfoRepository.findByUserId(currentUser.getId())
                    .map(List::of)
                    .orElse(List.of());
        }

        List<UserPreferenceDto> userInfoDtos = info.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new UserPreferenceListResponseDto(
                200,
                true,
                ResponseMessage.USER_INFO_FETCH_SUCCESS,
                userInfoDtos);
    }

    @Override
    public UserPreferenceResponseDto get(UUID id) {
        UserInfo userInfo = findPreferenceById(id);

        User currentUser = userUtil.getAuthenticatedUser();
        if (!userInfo.getUser().getId().equals(currentUser.getId()) && !isAdmin(currentUser)) {
            throw new UnauthorizedAccessException("You don't have permission to access this user's information");
        }

        UserPreferenceDto dto = mapToDto(userInfo);
        return new UserPreferenceResponseDto(
                200, true, ResponseMessage.USER_INFO_FETCH_SUCCESS, dto);
    }

    @Override
    public UserPreferenceResponseDto getByUserId(UUID id) {
        User currentUser = userUtil.getAuthenticatedUser();
        boolean isAdmin = isAdmin(currentUser);

        if (!currentUser.getId().equals(id) && !isAdmin) {
            throw new UnauthorizedAccessException("You don't have permission to access this user's information");
        }

        UserInfo userInfo = findPreferenceByUserId(id);

        UserPreferenceDto dto = mapToDto(userInfo);
        return new UserPreferenceResponseDto(
                200, true, ResponseMessage.USER_INFO_FETCH_SUCCESS, dto);
    }

    @Override
    @Transactional
    public UserPreferenceResponseDto update(UserPreferenceRequestDto updateRequestDto, UUID id) {
        UserInfo userInfo = findPreferenceById(id);

        User currentUser = userUtil.getAuthenticatedUser();
        if (!userInfo.getUser().getId().equals(currentUser.getId()) && !isAdmin(currentUser)) {
            throw new UnauthorizedAccessException("You don't have permission to update this user's information");
        }

        userInfo.setPhone(updateRequestDto.getPhone());
        userInfo.setBio(updateRequestDto.getBio());
        userInfo.setLocation(updateRequestDto.getLocation());
        userInfo.setWebsite(updateRequestDto.getWebsite());
        userInfo.setBirthday(updateRequestDto.getBirthday());
        userInfo.setProfileImage(updateRequestDto.getProfile_image());
        userInfo.setCoverImage(updateRequestDto.getCover_image());

        UserInfo savedPreference = userInfoRepository.save(userInfo);
        UserPreferenceDto dto = mapToDto(savedPreference);

        return new UserPreferenceResponseDto(200, true, ResponseMessage.USER_INFO_UPDATE_SUCCESS, dto);
    }

    @Override
    @Transactional
    public BaseResponseDto delete(UUID id) {
        UserInfo userInfo = findPreferenceById(id);

        User currentUser = userUtil.getAuthenticatedUser();
        if (!userInfo.getUser().getId().equals(currentUser.getId()) && !isAdmin(currentUser)) {
            throw new UnauthorizedAccessException("You don't have permission to delete this user's information");
        }

        userInfoRepository.delete(userInfo);
        return new BaseResponseDto(200, true, ResponseMessage.USER_INFO_DELETE_SUCCESS);
    }

    @Override
    @Transactional
    public UserPreferenceResponseDto updateByUserId(UserPreferenceRequestDto updateRequestDto, UUID userId) {
        UserInfo userInfo = findPreferenceByUserId(userId);
        return update(updateRequestDto, userInfo.getId());
    }

    @Override
    @Transactional
    public BaseResponseDto deleteByUserId(UUID userId) {
        UserInfo userInfo = findPreferenceByUserId(userId);
        return delete(userInfo.getId());
    }

    private UserPreferenceDto mapToDto(UserInfo userInfo) {
        UserPreferenceDto dto = modelMapper.map(userInfo, UserPreferenceDto.class);
        dto.setUserId(userInfo.getUser().getId());
        return dto;
    }

    private UserInfo findPreferenceById(UUID id) {
        return userInfoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("No user's information found with id: %s", id)));
    }

    private UserInfo findPreferenceByUserId(UUID userId) {
        return userInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("No user's information found for user with id: %s", userId)));
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream().anyMatch(r -> r.name().equals("ADMIN"));
    }
}
