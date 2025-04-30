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
import com.devs.roamance.dto.request.user.UserPreferencesRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.user.UserPreferencesListResponseDto;
import com.devs.roamance.dto.response.user.UserPreferencesResponseDto;
import com.devs.roamance.exception.handler.GlobalExceptionHandler;
import com.devs.roamance.exception.handler.JwtExceptionHandler;
import com.devs.roamance.model.user.User;
import com.devs.roamance.service.UserPreferencesService;
import com.devs.roamance.util.UserUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UserPreferencesController.class)
@Import(WebMvcTestConfig.class)
@WithMockUser
class UserPreferencesControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @MockBean private UserPreferencesService userPreferencesService;

  @Autowired private UserUtil userUtil;

  @MockBean private GlobalExceptionHandler globalExceptionHandler;

  @MockBean private JwtExceptionHandler jwtExceptionHandler;

  @Test
  @DisplayName("Should return user preferences list when getting all user preferences")
  void getAllUserPreferencesShouldReturnUserPreferencesList() throws Exception {
    // Given
    UserPreferencesListResponseDto responseDto = new UserPreferencesListResponseDto();
    responseDto.setSuccess(true);
    when(userPreferencesService.getAll(anyInt(), anyInt(), anyString(), anyString()))
        .thenReturn(responseDto);

    // When & Then
    mockMvc
        .perform(
            get("/users/preferences")
                .param("pageNumber", "0")
                .param("pageSize", "10")
                .param("sortBy", "id")
                .param("sortDir", "asc"))
        .andDo(print())
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should return user preferences when getting by ID")
  void getUserPreferencesByIdShouldReturnUserPreferences() throws Exception {
    // Given
    UUID preferencesId = UUID.randomUUID();
    UserPreferencesResponseDto responseDto = new UserPreferencesResponseDto();
    responseDto.setSuccess(true);
    when(userPreferencesService.get(any(UUID.class))).thenReturn(responseDto);

    // When & Then
    mockMvc
        .perform(get("/users/preferences/{id}", preferencesId))
        .andDo(print())
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should return current user preferences")
  void getCurrentUserPreferencesShouldReturnUserPreferences() throws Exception {
    // Given
    UUID userId = UUID.randomUUID();
    UserPreferencesResponseDto responseDto = new UserPreferencesResponseDto();
    responseDto.setSuccess(true);

    User mockUser = new User();
    mockUser.setId(userId);

    when(userUtil.getAuthenticatedUser()).thenReturn(mockUser);
    when(userPreferencesService.getByUserId(any(UUID.class))).thenReturn(responseDto);

    // When & Then
    mockMvc.perform(get("/users/preferences/me")).andDo(print()).andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should return user preferences by user ID")
  void getUserPreferencesByUserIdShouldReturnUserPreferences() throws Exception {
    // Given
    UUID userId = UUID.randomUUID();
    UserPreferencesResponseDto responseDto = new UserPreferencesResponseDto();
    responseDto.setSuccess(true);
    when(userPreferencesService.getByUserId(any(UUID.class))).thenReturn(responseDto);

    // When & Then
    mockMvc
        .perform(get("/users/preferences/user/{userId}", userId))
        .andDo(print())
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should create user preferences with valid request")
  void createUserPreferencesShouldCreateWithValidRequest() throws Exception {
    // Given
    UserPreferencesRequestDto requestDto = new UserPreferencesRequestDto();

    UserPreferencesResponseDto responseDto = new UserPreferencesResponseDto();
    responseDto.setSuccess(true);

    when(userPreferencesService.create(any(UserPreferencesRequestDto.class)))
        .thenReturn(responseDto);

    // When & Then
    String content = objectMapper.writeValueAsString(requestDto);
    mockMvc
        .perform(
            post("/users/preferences").contentType(MediaType.APPLICATION_JSON).content(content))
        .andDo(print())
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should update current user preferences with valid request")
  void updateUserPreferencesShouldUpdateWithValidRequest() throws Exception {
    // Given
    UUID userId = UUID.randomUUID();
    UserPreferencesRequestDto requestDto = new UserPreferencesRequestDto();

    UserPreferencesResponseDto responseDto = new UserPreferencesResponseDto();
    responseDto.setSuccess(true);

    User mockUser = new User();
    mockUser.setId(userId);

    when(userUtil.getAuthenticatedUser()).thenReturn(mockUser);
    when(userPreferencesService.updateByUserId(
            any(UserPreferencesRequestDto.class), any(UUID.class)))
        .thenReturn(responseDto);

    // When & Then
    String content = objectMapper.writeValueAsString(requestDto);
    mockMvc
        .perform(put("/users/preferences").contentType(MediaType.APPLICATION_JSON).content(content))
        .andDo(print())
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should update user preferences by ID with valid request")
  void updateUserPreferencesByIdShouldUpdateWithValidRequest() throws Exception {
    // Given
    UUID preferencesId = UUID.randomUUID();
    UserPreferencesRequestDto requestDto = new UserPreferencesRequestDto();

    UserPreferencesResponseDto responseDto = new UserPreferencesResponseDto();
    responseDto.setSuccess(true);

    when(userPreferencesService.update(any(UserPreferencesRequestDto.class), any(UUID.class)))
        .thenReturn(responseDto);

    // When & Then
    String content = objectMapper.writeValueAsString(requestDto);
    mockMvc
        .perform(
            put("/users/preferences/{id}", preferencesId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(content))
        .andDo(print())
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should delete current user preferences when requested")
  void deleteUserPreferencesShouldDeleteWhenRequested() throws Exception {
    // Given
    UUID userId = UUID.randomUUID();
    BaseResponseDto responseDto =
        new BaseResponseDto(1, true, "User preferences deleted successfully");

    User mockUser = new User();
    mockUser.setId(userId);

    when(userUtil.getAuthenticatedUser()).thenReturn(mockUser);
    when(userPreferencesService.deleteByUserId(any(UUID.class))).thenReturn(responseDto);

    // When & Then
    mockMvc.perform(delete("/users/preferences")).andDo(print()).andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should delete user preferences by ID when valid ID is provided")
  void deleteUserPreferencesByIdShouldDeleteWhenValidIdIsProvided() throws Exception {
    // Given
    UUID preferencesId = UUID.randomUUID();
    BaseResponseDto responseDto =
        new BaseResponseDto(1, true, "User preferences deleted successfully");
    when(userPreferencesService.delete(any(UUID.class))).thenReturn(responseDto);

    // When & Then
    mockMvc
        .perform(delete("/users/preferences/{id}", preferencesId))
        .andDo(print())
        .andExpect(status().isOk());
  }
}
