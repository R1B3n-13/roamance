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
import com.devs.roamance.dto.request.travel.LocationCreateRequestDto;
import com.devs.roamance.dto.request.travel.LocationUpdateRequestDto;
import com.devs.roamance.dto.request.travel.journal.ActivitySubsectionCreateRequestDto;
import com.devs.roamance.dto.request.travel.journal.ActivitySubsectionUpdateRequestDto;
import com.devs.roamance.dto.request.travel.journal.SubsectionCreateRequestDto;
import com.devs.roamance.dto.request.travel.journal.SubsectionUpdateRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.travel.journal.SubsectionListResponseDto;
import com.devs.roamance.dto.response.travel.journal.SubsectionResponseDto;
import com.devs.roamance.exception.handler.GlobalExceptionHandler;
import com.devs.roamance.exception.handler.JwtExceptionHandler;
import com.devs.roamance.model.common.ActivityType;
import com.devs.roamance.model.travel.journal.SubsectionType;
import com.devs.roamance.service.SubsectionService;
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

@WebMvcTest(SubsectionController.class)
@Import(WebMvcTestConfig.class)
@WithMockUser
class SubsectionControllerTest {

    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SubsectionService subsectionService;
    
    @MockBean
    private GlobalExceptionHandler globalExceptionHandler;
    
    @MockBean
    private JwtExceptionHandler jwtExceptionHandler;

    @Test
    @DisplayName("Should return subsections list when getting all subsections")
    void getAllSubsectionsShouldReturnSubsectionsList() throws Exception {
        // Given
        SubsectionListResponseDto responseDto = new SubsectionListResponseDto();
        responseDto.setSuccess(true);
        when(subsectionService.getAll(anyInt(), anyInt(), anyString(), anyString())).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(get("/travel/subsections")
                .param("pageNumber", "0")
                .param("pageSize", "10")
                .param("sortBy", "id")
                .param("sortDir", "asc"))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return subsection when getting by ID")
    void getSubsectionByIdShouldReturnSubsection() throws Exception {
        // Given
        UUID subsectionId = UUID.randomUUID();
        SubsectionResponseDto responseDto = new SubsectionResponseDto();
        responseDto.setSuccess(true);
        when(subsectionService.get(any(UUID.class))).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(get("/travel/subsections/{id}", subsectionId))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should create subsection with valid request")
    void createSubsectionShouldCreateWithValidRequest() throws Exception {
        // Given
        ActivitySubsectionCreateRequestDto requestDto = new ActivitySubsectionCreateRequestDto();
        requestDto.setTitle("Test Subsection");
        requestDto.setType(SubsectionType.ACTIVITY);
        requestDto.setJournalId(UUID.randomUUID());
        requestDto.setLocation(new LocationCreateRequestDto());
        requestDto.setActivityType(ActivityType.OTHER);
        
        SubsectionResponseDto responseDto = new SubsectionResponseDto();
        responseDto.setSuccess(true);
        
        when(subsectionService.create(any(SubsectionCreateRequestDto.class))).thenReturn(responseDto);

        // When & Then
        String content = objectMapper.writeValueAsString(requestDto);
        mockMvc.perform(post("/travel/subsections")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should update subsection with valid request")
    void updateSubsectionShouldUpdateWithValidRequest() throws Exception {
        // Given
        UUID subsectionId = UUID.randomUUID();
        ActivitySubsectionUpdateRequestDto requestDto = new ActivitySubsectionUpdateRequestDto();
        requestDto.setTitle("Updated Subsection");
        requestDto.setType(SubsectionType.ACTIVITY);
        requestDto.setLocation(new LocationUpdateRequestDto());
        requestDto.setActivityType(ActivityType.OTHER);
        
        SubsectionResponseDto responseDto = new SubsectionResponseDto();
        responseDto.setSuccess(true);
        
        when(subsectionService.update(any(SubsectionUpdateRequestDto.class), any(UUID.class))).thenReturn(responseDto);

        // When & Then
        String content = objectMapper.writeValueAsString(requestDto);
        mockMvc.perform(put("/travel/subsections/{id}", subsectionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(content))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should delete subsection when valid ID is provided")
    void deleteSubsectionShouldDeleteWhenValidIdIsProvided() throws Exception {
        // Given
        UUID subsectionId = UUID.randomUUID();
        BaseResponseDto responseDto = new BaseResponseDto(1, true, "Subsection deleted successfully");
        when(subsectionService.delete(any(UUID.class))).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(delete("/travel/subsections/{id}", subsectionId))
                .andDo(print())
                .andExpect(status().isOk());
    }
}
