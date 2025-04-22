package com.devs.roamance.controller;

import static org.mockito.Mockito.when;

import com.devs.roamance.dto.response.social.ChatResponseDto;
import com.devs.roamance.exception.handler.GlobalExceptionHandler;
import com.devs.roamance.exception.handler.JwtExceptionHandler;
import com.devs.roamance.service.ChatService;
import com.diffblue.cover.annotations.MethodsUnderTest;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.aot.DisabledInAotMode;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ContextConfiguration(classes = {ChatController.class, GlobalExceptionHandler.class, JwtExceptionHandler.class})
@ExtendWith(SpringExtension.class)
@DisabledInAotMode
class ChatControllerDiffblueTest {
    @Autowired
    private ChatController chatController;

    @MockitoBean
    private ChatService chatService;

    @Autowired
    private GlobalExceptionHandler globalExceptionHandler;

    @Autowired
    private JwtExceptionHandler jwtExceptionHandler;

    /**
     * Test {@link ChatController#createChat(UUID)}.
     * <p>
     * Method under test: {@link ChatController#createChat(UUID)}
     */
    @Test
    @DisplayName("Test createChat(UUID)")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({"org.springframework.http.ResponseEntity ChatController.createChat(UUID)"})
    void testCreateChat() throws Exception {
        // Arrange
        when(chatService.create(Mockito.<UUID>any())).thenReturn(new ChatResponseDto());
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.post("/chats/create/user/{userId}",
                UUID.randomUUID());

        // Act and Assert
        MockMvcBuilders.standaloneSetup(chatController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(
                        MockMvcResultMatchers.content().string("{\"status\":0,\"success\":false,\"message\":null,\"data\":null}"));
    }

    /**
     * Test {@link ChatController#getChatById(UUID)}.
     * <p>
     * Method under test: {@link ChatController#getChatById(UUID)}
     */
    @Test
    @DisplayName("Test getChatById(UUID)")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({"org.springframework.http.ResponseEntity ChatController.getChatById(UUID)"})
    void testGetChatById() throws Exception {
        // Arrange
        when(chatService.get(Mockito.<UUID>any())).thenReturn(new ChatResponseDto());
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.get("/chats/{chatId}", UUID.randomUUID());

        // Act and Assert
        MockMvcBuilders.standaloneSetup(chatController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(
                        MockMvcResultMatchers.content().string("{\"status\":0,\"success\":false,\"message\":null,\"data\":null}"));
    }
}
