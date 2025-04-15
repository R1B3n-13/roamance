package com.devs.roamance.service;

import com.devs.roamance.dto.request.user.UserPreferenceRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.user.UserPreferenceListResponseDto;
import com.devs.roamance.dto.response.user.UserPreferenceResponseDto;
import java.util.UUID;

public interface UserPreferenceService
    extends BaseService<
        UserPreferenceResponseDto,
        UserPreferenceResponseDto,
        UserPreferenceRequestDto,
        UserPreferenceRequestDto,
        UUID> {

  UserPreferenceListResponseDto getAll(int pageNumber, int pageSize, String sortBy, String sortDir);

  UserPreferenceResponseDto getByUserId(UUID id);

  UserPreferenceResponseDto updateByUserId(UserPreferenceRequestDto updateRequestDto, UUID userId); // Added request DTO parameter

  BaseResponseDto deleteByUserId(UUID id);
}
