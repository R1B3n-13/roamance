package com.devs.roamance.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.devs.roamance.config.WebMvcTestConfig;
import com.devs.roamance.exception.handler.GlobalExceptionHandler;
import com.devs.roamance.exception.handler.JwtExceptionHandler;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AdminController.class)
@Import(WebMvcTestConfig.class)
@WithMockUser(roles = {"ADMIN"})
class AdminControllerTest {
    
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GlobalExceptionHandler globalExceptionHandler;

    @MockBean
    private JwtExceptionHandler jwtExceptionHandler;

    @Test
    @DisplayName("Should return success when accessing admin dashboard")
    void adminDashboardShouldReturnSuccess() throws Exception {
        mockMvc.perform(get("/admin/dashboard"))
                .andDo(print()) // Print response for debugging
                .andExpect(status().isOk());
    }
}