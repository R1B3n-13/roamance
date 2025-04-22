package com.devs.roamance.controller;

import static org.mockito.Mockito.when;

import com.devs.roamance.dto.request.auth.AuthRequestDto;
import com.devs.roamance.dto.request.auth.RefreshTokenRequestDto;
import com.devs.roamance.dto.response.auth.AuthResponseDto;
import com.devs.roamance.exception.handler.GlobalExceptionHandler;
import com.devs.roamance.exception.handler.JwtExceptionHandler;
import com.devs.roamance.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.aot.DisabledInAotMode;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ContextConfiguration(classes = {AuthController.class, GlobalExceptionHandler.class, JwtExceptionHandler.class})
@ExtendWith(SpringExtension.class)
@DisabledInAotMode
class AuthControllerDiffblueTest {
    @Autowired
    private AuthController authController;

    @MockitoBean
    private AuthService authService;

    @Autowired
    private GlobalExceptionHandler globalExceptionHandler;

    @Autowired
    private JwtExceptionHandler jwtExceptionHandler;

    /**
     * Test {@link AuthController#login(AuthRequestDto)}.
     * <p>
     * Method under test: {@link AuthController#login(AuthRequestDto)}
     */
    @Test
    @DisplayName("Test login(AuthRequestDto)")
    @Tag("MaintainedByDiffblue")
    void testLogin() throws Exception {
        // Arrange
        when(authService.login(Mockito.<AuthRequestDto>any())).thenReturn(new AuthResponseDto("ABC123", "ABC123"));

        AuthRequestDto authRequestDto = new AuthRequestDto();
        authRequestDto.setEmail("jane.doe@example.org");
        authRequestDto.setPassword("iloveyou");
        String content = (new ObjectMapper()).writeValueAsString(authRequestDto);
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content);

        // Act and Assert
        MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(MockMvcResultMatchers.content()
                        .string(
                                "{\"status\":0,\"success\":false,\"message\":null,\"access_token\":\"ABC123\",\"refresh_token\":\"ABC123\"}"));
    }

    /**
     * Test {@link AuthController#refreshToken(RefreshTokenRequestDto)}.
     * <p>
     * Method under test: {@link AuthController#refreshToken(RefreshTokenRequestDto)}
     */
    @Test
    @DisplayName("Test refreshToken(RefreshTokenRequestDto)")
    @Tag("MaintainedByDiffblue")
    void testRefreshToken() throws Exception {
        // Arrange
        when(authService.refreshToken(Mockito.<RefreshTokenRequestDto>any()))
                .thenReturn(new AuthResponseDto("ABC123", "ABC123"));

        RefreshTokenRequestDto refreshTokenRequestDto = new RefreshTokenRequestDto();
        refreshTokenRequestDto.setRefreshToken("ABC123");
        String content = (new ObjectMapper()).writeValueAsString(refreshTokenRequestDto);
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.post("/auth/refresh-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content);

        // Act and Assert
        MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(MockMvcResultMatchers.content()
                        .string(
                                "{\"status\":0,\"success\":false,\"message\":null,\"access_token\":\"ABC123\",\"refresh_token\":\"ABC123\"}"));
    }
}
