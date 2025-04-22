package com.devs.roamance.controller;

import static org.mockito.Mockito.when;

import com.devs.roamance.dto.request.social.CommentRequestDto;
import com.devs.roamance.dto.response.social.CommentListResponseDto;
import com.devs.roamance.dto.response.social.CommentResponseDto;
import com.devs.roamance.exception.handler.GlobalExceptionHandler;
import com.devs.roamance.exception.handler.JwtExceptionHandler;
import com.devs.roamance.service.CommentService;
import com.diffblue.cover.annotations.MethodsUnderTest;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.UUID;

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

@ContextConfiguration(classes = {CommentController.class, GlobalExceptionHandler.class, JwtExceptionHandler.class})
@ExtendWith(SpringExtension.class)
@DisabledInAotMode
class CommentControllerDiffblueTest {
    @Autowired
    private CommentController commentController;

    @MockitoBean
    private CommentService commentService;

    @Autowired
    private GlobalExceptionHandler globalExceptionHandler;

    @Autowired
    private JwtExceptionHandler jwtExceptionHandler;

    /**
     * Test {@link CommentController#createComment(CommentRequestDto, UUID)}.
     * <p>
     * Method under test: {@link CommentController#createComment(CommentRequestDto, UUID)}
     */
    @Test
    @DisplayName("Test createComment(CommentRequestDto, UUID)")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({
            "org.springframework.http.ResponseEntity CommentController.createComment(CommentRequestDto, UUID)"})
    void testCreateComment() throws Exception {
        // Arrange
        when(commentService.create(Mockito.<CommentRequestDto>any(), Mockito.<UUID>any()))
                .thenReturn(new CommentResponseDto());

        CommentRequestDto commentRequestDto = new CommentRequestDto();
        commentRequestDto.setImagePath("Image Path");
        commentRequestDto.setText("Text");
        commentRequestDto.setVideoPath("Video Path");
        String content = (new ObjectMapper()).writeValueAsString(commentRequestDto);
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders
                .post("/comments/create/post/{postId}", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(content);

        // Act and Assert
        MockMvcBuilders.standaloneSetup(commentController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(
                        MockMvcResultMatchers.content().string("{\"status\":0,\"success\":false,\"message\":null,\"data\":null}"));
    }

    /**
     * Test {@link CommentController#getCommentById(UUID)}.
     * <p>
     * Method under test: {@link CommentController#getCommentById(UUID)}
     */
    @Test
    @DisplayName("Test getCommentById(UUID)")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({"org.springframework.http.ResponseEntity CommentController.getCommentById(UUID)"})
    void testGetCommentById() throws Exception {
        // Arrange
        when(commentService.get(Mockito.<UUID>any())).thenReturn(new CommentResponseDto());
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.get("/comments/{commentId}",
                UUID.randomUUID());

        // Act and Assert
        MockMvcBuilders.standaloneSetup(commentController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(
                        MockMvcResultMatchers.content().string("{\"status\":0,\"success\":false,\"message\":null,\"data\":null}"));
    }

    /**
     * Test {@link CommentController#getCommentsByPostId(UUID, Integer, Integer, String, String)}.
     * <p>
     * Method under test: {@link CommentController#getCommentsByPostId(UUID, Integer, Integer, String, String)}
     */
    @Test
    @DisplayName("Test getCommentsByPostId(UUID, Integer, Integer, String, String)")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({
            "org.springframework.http.ResponseEntity CommentController.getCommentsByPostId(UUID, Integer, Integer, String, String)"})
    void testGetCommentsByPostId() throws Exception {
        // Arrange
        when(commentService.getByPostId(Mockito.<UUID>any(), Mockito.<Integer>any(), Mockito.<Integer>any(),
                Mockito.<String>any(), Mockito.<String>any())).thenReturn(new CommentListResponseDto());
        MockHttpServletRequestBuilder getResult = MockMvcRequestBuilders.get("/comments/by-post/{postId}",
                UUID.randomUUID());
        MockHttpServletRequestBuilder paramResult = getResult.param("pageNumber", String.valueOf(1));
        MockHttpServletRequestBuilder requestBuilder = paramResult.param("pageSize", String.valueOf(1))
                .param("sortBy", "foo")
                .param("sortDir", "foo");

        // Act and Assert
        MockMvcBuilders.standaloneSetup(commentController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(
                        MockMvcResultMatchers.content().string("{\"status\":0,\"success\":false,\"message\":null,\"data\":[]}"));
    }
}
