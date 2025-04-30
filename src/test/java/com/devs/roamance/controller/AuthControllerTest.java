package com.devs.roamance.controller;

import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.devs.roamance.config.WebMvcTestConfig;
import com.devs.roamance.dto.request.auth.AuthRequestDto;
import com.devs.roamance.dto.request.auth.RefreshTokenRequestDto;
import com.devs.roamance.dto.response.auth.AuthResponseDto;
import com.devs.roamance.service.AuthService;
import com.devs.roamance.exception.handler.GlobalExceptionHandler;
import com.devs.roamance.exception.handler.JwtExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@Import(WebMvcTestConfig.class)
@WithMockUser
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private GlobalExceptionHandler globalExceptionHandler;

    @MockBean
    private JwtExceptionHandler jwtExceptionHandler;

    @BeforeEach
    void setUp() {
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    @DisplayName("Login should return access and refresh tokens when successful")
    void loginShouldReturnTokens() throws Exception {
        // Given
        String accessToken = "access-token-123";
        String refreshToken = "refresh-token-123";
        AuthRequestDto loginRequest = new AuthRequestDto();
        loginRequest.setEmail("user@example.com");
        loginRequest.setPassword("password123");

        when(authService.login(any(AuthRequestDto.class)))
                .thenReturn(new AuthResponseDto(accessToken, refreshToken));

        // When & Then
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Refresh token should return new access and refresh tokens when valid")
    void refreshTokenShouldReturnNewTokens() throws Exception {
        // Given
        String newAccessToken = "new-access-token-456";
        String newRefreshToken = "new-refresh-token-456";
        RefreshTokenRequestDto refreshRequest = new RefreshTokenRequestDto();
        refreshRequest.setRefreshToken("old-refresh-token");

        when(authService.refreshToken(any(RefreshTokenRequestDto.class)))
                .thenReturn(new AuthResponseDto(newAccessToken, newRefreshToken));

        // When & Then
        mockMvc.perform(post("/auth/refresh-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(refreshRequest)))
                .andDo(print())
                .andExpect(status().isOk());
    }
}