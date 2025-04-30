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
import com.devs.roamance.dto.request.user.UserCreateRequestDto;
import com.devs.roamance.dto.request.user.UserUpdateRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.user.UserListResponseDto;
import com.devs.roamance.dto.response.user.UserResponseDto;
import com.devs.roamance.exception.handler.GlobalExceptionHandler;
import com.devs.roamance.exception.handler.JwtExceptionHandler;
import com.devs.roamance.model.user.User;
import com.devs.roamance.service.UserService;
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

@WebMvcTest(UserController.class)
@Import(WebMvcTestConfig.class)
@WithMockUser
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;
    
    @Autowired
    private UserUtil userUtil;
    
    @MockBean
    private GlobalExceptionHandler globalExceptionHandler;
    
    @MockBean
    private JwtExceptionHandler jwtExceptionHandler;

    @Test
    @DisplayName("Should create user with valid request")
    void createUserShouldCreateWithValidRequest() throws Exception {
        // Given
        UserCreateRequestDto requestDto = new UserCreateRequestDto();
        requestDto.setEmail("test@example.com");
        requestDto.setPassword("password123");
        requestDto.setName("Test User");
        
        UserResponseDto responseDto = new UserResponseDto();
        responseDto.setSuccess(true);
        responseDto.setStatus(201);
        when(userService.create(any(UserCreateRequestDto.class))).thenReturn(responseDto);

        // When & Then
        String content = objectMapper.writeValueAsString(requestDto);
        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return users list when getting all users")
    void getAllUsersShouldReturnUsersList() throws Exception {
        // Given
        UserListResponseDto responseDto = new UserListResponseDto();
        responseDto.setSuccess(true);
        when(userService.getAll(anyInt(), anyInt(), anyString(), anyString())).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(get("/users")
                .param("pageNumber", "0")
                .param("pageSize", "10")
                .param("sortBy", "name")
                .param("sortDir", "asc"))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return user when getting by ID")
    void getUserByIdShouldReturnUser() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        UserResponseDto responseDto = new UserResponseDto();
        responseDto.setSuccess(true);
        when(userService.get(any(UUID.class))).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(get("/users/{userId}", userId))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return user when getting by email")
    void getUserByEmailShouldReturnUser() throws Exception {
        // Given
        String email = "test@example.com";
        UserResponseDto responseDto = new UserResponseDto();
        responseDto.setSuccess(true);
        when(userService.getByEmail(anyString())).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(get("/users/by-email")
                .param("email", email))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return current user profile")
    void getUserProfileShouldReturnCurrentUser() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        UserResponseDto responseDto = new UserResponseDto();
        responseDto.setSuccess(true);
        
        User mockUser = new User();
        mockUser.setId(userId);
        
        when(userUtil.getAuthenticatedUser()).thenReturn(mockUser);
        when(userService.get(any(UUID.class))).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(get("/users/me"))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return users list when searching")
    void searchUsersShouldReturnUsersList() throws Exception {
        // Given
        String query = "john";
        UserListResponseDto responseDto = new UserListResponseDto();
        responseDto.setSuccess(true);
        when(userService.search(anyString(), anyInt(), anyInt())).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(get("/users/search")
                .param("query", query)
                .param("pageNumber", "0")
                .param("pageSize", "10"))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should update user with valid request")
    void updateUserShouldUpdateWithValidRequest() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        UserUpdateRequestDto requestDto = new UserUpdateRequestDto();
        requestDto.setName("Updated Name");
        
        UserResponseDto responseDto = new UserResponseDto();
        responseDto.setSuccess(true);
        responseDto.setStatus(200);
        
        User mockUser = new User();
        mockUser.setId(userId);
        
        when(userUtil.getAuthenticatedUser()).thenReturn(mockUser);
        when(userService.update(any(UserUpdateRequestDto.class), any(UUID.class))).thenReturn(responseDto);

        // When & Then
        String content = objectMapper.writeValueAsString(requestDto);
        mockMvc.perform(put("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should delete user when requested")
    void deleteUserShouldDeleteWhenRequested() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        BaseResponseDto responseDto = new BaseResponseDto(1, true, "User deleted successfully");
        
        User mockUser = new User();
        mockUser.setId(userId);
        
        when(userUtil.getAuthenticatedUser()).thenReturn(mockUser);
        when(userService.delete(any(UUID.class))).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(delete("/users"))
                .andDo(print())
                .andExpect(status().isOk());
    }
}