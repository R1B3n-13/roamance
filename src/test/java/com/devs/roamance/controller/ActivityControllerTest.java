package com.devs.roamance.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.devs.roamance.config.WebMvcTestConfig;
import com.devs.roamance.dto.request.travel.LocationUpdateRequestDto;
import com.devs.roamance.dto.request.travel.itinerary.ActivityUpdateRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.travel.itinerary.ActivityListResponseDto;
import com.devs.roamance.dto.response.travel.itinerary.ActivityResponseDto;
import com.devs.roamance.exception.handler.GlobalExceptionHandler;
import com.devs.roamance.exception.handler.JwtExceptionHandler;
import com.devs.roamance.service.ActivityService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

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

@WebMvcTest(ActivityController.class)
@Import(WebMvcTestConfig.class)
@WithMockUser
class ActivityControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ActivityService activityService;
    @MockBean
    private GlobalExceptionHandler globalExceptionHandler;
    @MockBean
    private JwtExceptionHandler jwtExceptionHandler;

    @BeforeEach
    void setUp() {
        objectMapper.registerModule(new JavaTimeModule()); // Add JavaTimeModule for serializing LocalTime
    }

    @Test
    @DisplayName("Should return activity when getting by ID")
    void getActivityByIdShouldReturnActivity() throws Exception {
        // Given
        UUID activityId = UUID.randomUUID();
        ActivityResponseDto responseDto = new ActivityResponseDto();
        responseDto.setSuccess(true);
        when(activityService.get(any(UUID.class))).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(get("/travel/activities/{activityId}", activityId))
                .andDo(print()) // Print response for debugging
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return activities list when getting activities by day plan ID")
    void getActivitiesByDayPlanIdShouldReturnActivitiesList() throws Exception {
        // Given
        UUID dayPlanId = UUID.randomUUID();
        ActivityListResponseDto responseDto = new ActivityListResponseDto();
        responseDto.setSuccess(true);
        when(activityService.getByDayPlanId(any(UUID.class), anyInt(), anyInt(), any(String.class), any(String.class)))
                .thenReturn(responseDto);

        // When & Then
        mockMvc.perform(get("/travel/activities/day-plan/{dayPlanId}", dayPlanId)
                .param("pageNumber", "1")
                .param("pageSize", "1")
                .param("sortBy", "foo")
                .param("sortDir", "foo"))
                .andDo(print()) // Print response for debugging
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should update activity with valid request")
    void updateActivityShouldUpdateWithValidRequest() throws Exception {
        // Given
        UUID activityId = UUID.randomUUID();
        ActivityUpdateRequestDto requestDto = new ActivityUpdateRequestDto();
        ActivityResponseDto responseDto = new ActivityResponseDto();
        responseDto.setSuccess(true);
        when(activityService.update(any(ActivityUpdateRequestDto.class), any(UUID.class)))
                .thenReturn(responseDto);

        // When & Then
        String content = objectMapper.writeValueAsString(requestDto);
        mockMvc.perform(put("/travel/activities/{activityId}", activityId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(content))
                .andDo(print()) // Print response for debugging
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should delete activity when valid ID is provided")
    void deleteActivityShouldDeleteWhenValidIdIsProvided() throws Exception {
        // Given
        UUID activityId = UUID.randomUUID();
        BaseResponseDto responseDto = new BaseResponseDto(1, true, "Not all who wander are lost");
        when(activityService.delete(any(UUID.class))).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(delete("/travel/activities/{activityId}", activityId))
                .andDo(print()) // Print response for debugging
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should handle activity update with LocalTime properties")
    void updateActivityWithLocalTimePropertiesShouldWork() throws Exception {
        // Given
        UUID activityId = UUID.randomUUID();
        ActivityUpdateRequestDto requestDto = new ActivityUpdateRequestDto();
        requestDto.setCost(new BigDecimal("2.3"));
        requestDto.setEndTime(LocalTime.MIDNIGHT);
        requestDto.setLocation(new LocationUpdateRequestDto());
        requestDto.setNote("Note");
        requestDto.setStartTime(LocalTime.MIDNIGHT);
        requestDto.setType("Type");

        ActivityResponseDto responseDto = new ActivityResponseDto();
        responseDto.setSuccess(true);
        when(activityService.update(any(ActivityUpdateRequestDto.class), any(UUID.class)))
                .thenReturn(responseDto);

        // When & Then
        String content = objectMapper.writeValueAsString(requestDto);
        mockMvc.perform(put("/travel/activities/{activityId}", activityId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(content))
                .andDo(print()) // Print response for debugging
                .andExpect(status().isOk());
    }
}