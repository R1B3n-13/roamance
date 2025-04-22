package com.devs.roamance.controller;

import com.devs.roamance.exception.handler.GlobalExceptionHandler;
import com.devs.roamance.exception.handler.JwtExceptionHandler;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ContextConfiguration(classes = {AdminController.class, GlobalExceptionHandler.class, JwtExceptionHandler.class})
@ExtendWith(SpringExtension.class)
class AdminControllerDiffblueTest {
    @Autowired
    private AdminController adminController;

    @Autowired
    private GlobalExceptionHandler globalExceptionHandler;

    @Autowired
    private JwtExceptionHandler jwtExceptionHandler;

    /**
     * Test {@link AdminController#adminDashboard()}.
     * <p>
     * Method under test: {@link AdminController#adminDashboard()}
     */
    @Test
    @DisplayName("Test adminDashboard()")
    @Tag("MaintainedByDiffblue")
    void testAdminDashboard() throws Exception {
        // Arrange
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.get("/admin/dashboard");

        // Act and Assert
        MockMvcBuilders.standaloneSetup(adminController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("text/plain;charset=ISO-8859-1"))
                .andExpect(MockMvcResultMatchers.content().string("Welcome to the admin dashboard!"));
    }
}
