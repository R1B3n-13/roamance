package com.devs.roamance.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.devs.roamance.config.WebMvcTestConfig;
import com.devs.roamance.dto.request.user.UserInfoRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.user.UserInfoListResponseDto;
import com.devs.roamance.dto.response.user.UserInfoResponseDto;
import com.devs.roamance.exception.handler.GlobalExceptionHandler;
import com.devs.roamance.exception.handler.JwtExceptionHandler;
import com.devs.roamance.model.user.User;
import com.devs.roamance.service.UserInfoService;
import com.devs.roamance.util.UserUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UserInfoController.class)
@Import(WebMvcTestConfig.class)
@WithMockUser
class UserInfoControllerTest {

    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserInfoService userInfoService;
    
    @Autowired
    private UserUtil userUtil;
    
    @MockBean
    private GlobalExceptionHandler globalExceptionHandler;
    
    @MockBean
    private JwtExceptionHandler jwtExceptionHandler;

    @Test
    @DisplayName("Should return user info list when getting all users info")
    void getAllUsersInfoShouldReturnUserInfoList() throws Exception {
        // Given
        UserInfoListResponseDto responseDto = new UserInfoListResponseDto();
        responseDto.setSuccess(true);
        responseDto.setStatus(HttpStatus.OK.value());
        when(userInfoService.getAll(anyInt(), anyInt(), anyString(), anyString())).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(get("/users/info")
                .param("pageNumber", "0")
                .param("pageSize", "10")
                .param("sortBy", "id")
                .param("sortDir", "asc"))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return user info when getting by ID")
    void getUserInfoByIdShouldReturnUserInfo() throws Exception {
        // Given
        UUID id = UUID.randomUUID();
        UserInfoResponseDto responseDto = new UserInfoResponseDto();
        responseDto.setSuccess(true);
        responseDto.setStatus(HttpStatus.OK.value());
        when(userInfoService.get(any(UUID.class))).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(get("/users/info/{id}", id))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return current user profile")
    void getUserProfileShouldReturnCurrentUserInfo() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        UserInfoResponseDto responseDto = new UserInfoResponseDto();
        responseDto.setSuccess(true);
        
        User mockUser = new User();
        mockUser.setId(userId);
        
        when(userUtil.getAuthenticatedUser()).thenReturn(mockUser);
        when(userInfoService.getByUserId(any(UUID.class))).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(get("/users/info/me"))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should create user info with valid request")
    void createUserInfoShouldCreateWithValidRequest() throws Exception {
        // Given
        UserInfoRequestDto requestDto = new UserInfoRequestDto();
        requestDto.setBio("Test bio");
        
        UserInfoResponseDto responseDto = new UserInfoResponseDto();
        responseDto.setSuccess(true);
        responseDto.setStatus(HttpStatus.CREATED.value());
        when(userInfoService.create(any(UserInfoRequestDto.class))).thenReturn(responseDto);

        // When & Then
        String content = objectMapper.writeValueAsString(requestDto);
        mockMvc.perform(post("/users/info")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content))
                .andDo(print())
                .andExpect(status().isOk()); // The controller returns the status from the response
    }

    @Test
    @DisplayName("Should update current user info with valid request")
    void updateUserInfoShouldUpdateWithValidRequest() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        UserInfoRequestDto requestDto = new UserInfoRequestDto();
        requestDto.setBio("Updated bio");
        
        UserInfoResponseDto responseDto = new UserInfoResponseDto();
        responseDto.setSuccess(true);
        responseDto.setStatus(HttpStatus.OK.value());
        
        User mockUser = new User();
        mockUser.setId(userId);
        
        when(userUtil.getAuthenticatedUser()).thenReturn(mockUser);
        when(userInfoService.updateByUserId(any(UserInfoRequestDto.class), any(UUID.class))).thenReturn(responseDto);

        // When & Then
        String content = objectMapper.writeValueAsString(requestDto);
        mockMvc.perform(put("/users/info")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should update user info by ID with valid request")
    void updateUserInfoByIdShouldUpdateWithValidRequest() throws Exception {
        // Given
        UUID id = UUID.randomUUID();
        UserInfoRequestDto requestDto = new UserInfoRequestDto();
        requestDto.setBio("Updated bio by ID");
        
        UserInfoResponseDto responseDto = new UserInfoResponseDto();
        responseDto.setSuccess(true);
        responseDto.setStatus(HttpStatus.OK.value());
        
        when(userInfoService.update(any(UserInfoRequestDto.class), any(UUID.class))).thenReturn(responseDto);

        // When & Then
        String content = objectMapper.writeValueAsString(requestDto);
        mockMvc.perform(put("/users/info/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(content))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should delete current user info")
    void deleteUserInfoShouldDeleteCurrentUserInfo() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        BaseResponseDto responseDto = new BaseResponseDto();
        responseDto.setSuccess(true);
        responseDto.setStatus(HttpStatus.OK.value());
        
        User mockUser = new User();
        mockUser.setId(userId);
        
        when(userUtil.getAuthenticatedUser()).thenReturn(mockUser);
        when(userInfoService.deleteByUserId(any(UUID.class))).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(delete("/users/info"))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should delete user info by ID")
    void deleteUserInfoByIdShouldDeleteById() throws Exception {
        // Given
        UUID id = UUID.randomUUID();
        BaseResponseDto responseDto = new BaseResponseDto();
        responseDto.setSuccess(true);
        responseDto.setStatus(HttpStatus.OK.value());
        
        when(userInfoService.delete(any(UUID.class))).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(delete("/users/info/{id}", id))
                .andDo(print())
                .andExpect(status().isOk());
    }
}