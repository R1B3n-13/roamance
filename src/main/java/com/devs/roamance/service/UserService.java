package com.devs.roamance.service;

import com.devs.roamance.dto.request.user.UserCreateRequestDto;
import com.devs.roamance.dto.request.user.UserUpdateRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.user.UserListResponseDto;
import com.devs.roamance.dto.response.user.UserResponseDto;
import java.util.UUID;

public interface UserService
    extends BaseService<
        BaseResponseDto,
        UserResponseDto,
        UserListResponseDto,
        UserCreateRequestDto,
        UserUpdateRequestDto,
        UUID> {

  UserResponseDto getByEmail(String email);

  UserListResponseDto search(String query, int page, int size);
}
