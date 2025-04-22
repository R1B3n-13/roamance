package com.devs.roamance.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.devs.roamance.dto.request.travel.LocationCreateRequestDto;
import com.devs.roamance.dto.request.travel.LocationUpdateRequestDto;
import com.devs.roamance.dto.request.travel.itinerary.ActivityCreateRequestDto;
import com.devs.roamance.dto.request.travel.itinerary.ActivityUpdateRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.travel.itinerary.ActivityListResponseDto;
import com.devs.roamance.dto.response.travel.itinerary.ActivityResponseDto;
import com.devs.roamance.exception.handler.GlobalExceptionHandler;
import com.devs.roamance.exception.handler.JwtExceptionHandler;
import com.devs.roamance.service.ActivityService;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.aot.DisabledInAotMode;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ContextConfiguration(classes = {ActivityController.class, GlobalExceptionHandler.class, JwtExceptionHandler.class})
@ExtendWith(SpringExtension.class)
@DisabledInAotMode
class ActivityControllerDiffblueTest {
    @Autowired
    private ActivityController activityController;

    @MockitoBean
    private ActivityService activityService;

    @Autowired
    private GlobalExceptionHandler globalExceptionHandler;

    @Autowired
    private JwtExceptionHandler jwtExceptionHandler;

    /**
     * Test {@link ActivityController#getActivityById(UUID)}.
     * <p>
     * Method under test: {@link ActivityController#getActivityById(UUID)}
     */
    @Test
    @DisplayName("Test getActivityById(UUID)")
    @Tag("MaintainedByDiffblue")
    void testGetActivityById() throws Exception {
        // Arrange
        when(activityService.get(Mockito.<UUID>any())).thenReturn(new ActivityResponseDto());
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.get("/travel/activities/{activityId}",
                UUID.randomUUID());

        // Act and Assert
        MockMvcBuilders.standaloneSetup(activityController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(
                        MockMvcResultMatchers.content().string("{\"status\":0,\"success\":false,\"message\":null,\"data\":null}"));
    }

    /**
     * Test {@link ActivityController#getActivitiesByDayPlanId(UUID, int, int, String, String)}.
     * <p>
     * Method under test: {@link ActivityController#getActivitiesByDayPlanId(UUID, int, int, String, String)}
     */
    @Test
    @DisplayName("Test getActivitiesByDayPlanId(UUID, int, int, String, String)")
    @Tag("MaintainedByDiffblue")
    void testGetActivitiesByDayPlanId() throws Exception {
        // Arrange
        when(activityService.getByDayPlanId(Mockito.<UUID>any(), anyInt(), anyInt(), Mockito.<String>any(),
                Mockito.<String>any())).thenReturn(new ActivityListResponseDto());
        MockHttpServletRequestBuilder getResult = MockMvcRequestBuilders.get("/travel/activities/day-plan/{dayPlanId}",
                UUID.randomUUID());
        MockHttpServletRequestBuilder paramResult = getResult.param("pageNumber", String.valueOf(1));
        MockHttpServletRequestBuilder requestBuilder = paramResult.param("pageSize", String.valueOf(1))
                .param("sortBy", "foo")
                .param("sortDir", "foo");

        // Act and Assert
        MockMvcBuilders.standaloneSetup(activityController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(
                        MockMvcResultMatchers.content().string("{\"status\":0,\"success\":false,\"message\":null,\"data\":null}"));
    }

    /**
     * Test {@link ActivityController#updateActivity(UUID, ActivityUpdateRequestDto)}.
     * <p>
     * Method under test: {@link ActivityController#updateActivity(UUID, ActivityUpdateRequestDto)}
     */
    @Test
    @DisplayName("Test updateActivity(UUID, ActivityUpdateRequestDto)")
    @Disabled("TODO: Complete this test")
    @Tag("MaintainedByDiffblue")
    void testUpdateActivity() throws Exception {
        // TODO: Diffblue Cover was only able to create a partial test for this method:
        //   Reason: No inputs found that don't throw a trivial exception.
        //   Diffblue Cover tried to run the arrange/act section, but the method under
        //   test threw
        //   com.fasterxml.jackson.databind.exc.InvalidDefinitionException: Java 8 date/time type `java.time.LocalTime` not supported by default: add Module "com.fasterxml.jackson.datatype:jackson-datatype-jsr310" to enable handling (through reference chain: com.devs.roamance.dto.request.travel.itinerary.ActivityUpdateRequestDto["start_time"])
        //       at com.fasterxml.jackson.databind.exc.InvalidDefinitionException.from(InvalidDefinitionException.java:77)
        //       at com.fasterxml.jackson.databind.SerializerProvider.reportBadDefinition(SerializerProvider.java:1328)
        //       at com.fasterxml.jackson.databind.ser.impl.UnsupportedTypeSerializer.serialize(UnsupportedTypeSerializer.java:35)
        //       at com.fasterxml.jackson.databind.ser.BeanPropertyWriter.serializeAsField(BeanPropertyWriter.java:732)
        //       at com.fasterxml.jackson.databind.ser.std.BeanSerializerBase.serializeFields(BeanSerializerBase.java:770)
        //       at com.fasterxml.jackson.databind.ser.BeanSerializer.serialize(BeanSerializer.java:184)
        //       at com.fasterxml.jackson.databind.ser.DefaultSerializerProvider._serialize(DefaultSerializerProvider.java:502)
        //       at com.fasterxml.jackson.databind.ser.DefaultSerializerProvider.serializeValue(DefaultSerializerProvider.java:341)
        //       at com.fasterxml.jackson.databind.ObjectMapper._writeValueAndClose(ObjectMapper.java:4811)
        //       at com.fasterxml.jackson.databind.ObjectMapper.writeValueAsString(ObjectMapper.java:4052)
        //   See https://diff.blue/R013 to resolve this issue.

        // Arrange
        ActivityUpdateRequestDto activityUpdateRequestDto = new ActivityUpdateRequestDto();
        activityUpdateRequestDto.setCost(new BigDecimal("2.3"));
        activityUpdateRequestDto.setEndTime(LocalTime.MIDNIGHT);
        activityUpdateRequestDto.setLocation(new LocationUpdateRequestDto());
        activityUpdateRequestDto.setNote("Note");
        activityUpdateRequestDto.setStartTime(LocalTime.MIDNIGHT);
        activityUpdateRequestDto.setType("Type");
        String content = (new ObjectMapper()).writeValueAsString(activityUpdateRequestDto);
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders
                .put("/travel/activities/{activityId}", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(content);

        // Act
        MockMvcBuilders.standaloneSetup(activityController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder);
    }

    /**
     * Test {@link ActivityController#updateActivity(UUID, ActivityUpdateRequestDto)}.
     * <ul>
     *   <li>Then StatusCode return {@link HttpStatus}.</li>
     * </ul>
     * <p>
     * Method under test: {@link ActivityController#updateActivity(UUID, ActivityUpdateRequestDto)}
     */
    @Test
    @DisplayName("Test updateActivity(UUID, ActivityUpdateRequestDto); then StatusCode return HttpStatus")
    @Tag("MaintainedByDiffblue")
    void testUpdateActivity_thenStatusCodeReturnHttpStatus() {
        //   Diffblue Cover was unable to create a Spring-specific test for this Spring method.
        //   Run dcover create --keep-partial-tests to gain insights into why
        //   a non-Spring test was created.

        // Arrange
        ActivityService activityService = mock(ActivityService.class);
        ActivityResponseDto activityResponseDto = new ActivityResponseDto();
        when(activityService.update(Mockito.<ActivityUpdateRequestDto>any(), Mockito.<UUID>any()))
                .thenReturn(activityResponseDto);
        ActivityController activityController = new ActivityController(activityService);
        UUID activityId = UUID.randomUUID();

        // Act
        ResponseEntity<ActivityResponseDto> actualUpdateActivityResult = activityController.updateActivity(activityId,
                new ActivityUpdateRequestDto());

        // Assert
        verify(activityService).update(isA(ActivityUpdateRequestDto.class), isA(UUID.class));
        HttpStatusCode statusCode = actualUpdateActivityResult.getStatusCode();
        assertTrue(statusCode instanceof HttpStatus);
        assertEquals(200, actualUpdateActivityResult.getStatusCodeValue());
        assertEquals(HttpStatus.OK, statusCode);
        assertTrue(actualUpdateActivityResult.hasBody());
        assertTrue(actualUpdateActivityResult.getHeaders().isEmpty());
        assertSame(activityResponseDto, actualUpdateActivityResult.getBody());
    }

    /**
     * Test {@link ActivityController#deleteActivity(UUID)}.
     * <p>
     * Method under test: {@link ActivityController#deleteActivity(UUID)}
     */
    @Test
    @DisplayName("Test deleteActivity(UUID)")
    @Tag("MaintainedByDiffblue")
    void testDeleteActivity() throws Exception {
        // Arrange
        when(activityService.delete(Mockito.<UUID>any()))
                .thenReturn(new BaseResponseDto(1, true, "Not all who wander are lost"));
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.delete("/travel/activities/{activityId}",
                UUID.randomUUID());

        // Act and Assert
        MockMvcBuilders.standaloneSetup(activityController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(MockMvcResultMatchers.content()
                        .string("{\"status\":1,\"success\":true,\"message\":\"Not all who wander are lost\"}"));
    }
}
