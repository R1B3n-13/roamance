package com.devs.roamance.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.devs.roamance.dto.request.user.UserPreferenceRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.user.UserPreferenceListResponseDto;
import com.devs.roamance.dto.response.user.UserPreferenceResponseDto;
import com.devs.roamance.service.UserInfoService;
import com.devs.roamance.util.UserUtil;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/info")
public class UserInfoController {

    private final UserInfoService userInfoService;
    private final UserUtil userUtil;

    public UserInfoController(UserInfoService userInfoService, UserUtil userUtil) {
        this.userInfoService = userInfoService;
        this.userUtil = userUtil;
    }

    @GetMapping
    public ResponseEntity<UserPreferenceListResponseDto> getAllPreferences(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        UserPreferenceListResponseDto responseDto = userInfoService.getAll(pageNumber, pageSize, sortBy, sortDir);
        return ResponseEntity.status(responseDto.getStatus()).body(responseDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserPreferenceResponseDto> getPreferenceById(
            @PathVariable @NotNull UUID id) {
        UserPreferenceResponseDto responseDto = userInfoService.get(id);
        return ResponseEntity.status(responseDto.getStatus()).body(responseDto);
    }

    @GetMapping("/me")
    public ResponseEntity<UserPreferenceResponseDto> getUserProfile() {

        UUID userId = userUtil.getAuthenticatedUser().getId();

        UserPreferenceResponseDto responseDto = userInfoService.getByUserId(userId);

        return ResponseEntity.ok(responseDto);
    }

    @PostMapping
    public ResponseEntity<UserPreferenceResponseDto> createPreference(
            @Valid @RequestBody UserPreferenceRequestDto requestDto) {
        UserPreferenceResponseDto responseDto = userInfoService.create(requestDto);
        return ResponseEntity.status(responseDto.getStatus()).body(responseDto);
    }

    @PutMapping
    public ResponseEntity<UserPreferenceResponseDto> updatePreference(
            @Valid @RequestBody UserPreferenceRequestDto requestDto) {
        UUID userId = userUtil.getAuthenticatedUser().getId();
        UserPreferenceResponseDto responseDto = userInfoService.updateByUserId(requestDto, userId);
        return ResponseEntity.status(responseDto.getStatus()).body(responseDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserPreferenceResponseDto> updatePreferenceById(
            @PathVariable @NotNull UUID id,
            @Valid @RequestBody UserPreferenceRequestDto requestDto) {
        UserPreferenceResponseDto responseDto = userInfoService.update(requestDto, id);
        return ResponseEntity.status(responseDto.getStatus()).body(responseDto);
    }

    @DeleteMapping
    public ResponseEntity<BaseResponseDto> deletePreference() {
        UUID userId = userUtil.getAuthenticatedUser().getId();
        BaseResponseDto responseDto = userInfoService.deleteByUserId(userId);
        return ResponseEntity.status(responseDto.getStatus()).body(responseDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponseDto> deletePreferenceById(@PathVariable @NotNull UUID id) {
        BaseResponseDto responseDto = userInfoService.delete(id);
        return ResponseEntity.status(responseDto.getStatus()).body(responseDto);
    }
}
