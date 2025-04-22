package com.devs.roamance.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.devs.roamance.dto.request.travel.itinerary.DayPlanCreateRequestDto;
import com.devs.roamance.dto.request.travel.itinerary.DayPlanUpdateRequestDto;
import com.devs.roamance.dto.request.travel.itinerary.RoutePlanRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.travel.itinerary.DayPlanListResponseDto;
import com.devs.roamance.dto.response.travel.itinerary.DayPlanResponseDto;
import com.devs.roamance.exception.handler.GlobalExceptionHandler;
import com.devs.roamance.exception.handler.JwtExceptionHandler;
import com.devs.roamance.service.DayPlanService;
import com.diffblue.cover.annotations.MethodsUnderTest;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.ArrayList;
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
import org.springframework.test.web.servlet.result.StatusResultMatchers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ContextConfiguration(classes = {DayPlanController.class, GlobalExceptionHandler.class, JwtExceptionHandler.class})
@ExtendWith(SpringExtension.class)
@DisabledInAotMode
class DayPlanControllerDiffblueTest {
    @Autowired
    private DayPlanController dayPlanController;

    @MockitoBean
    private DayPlanService dayPlanService;

    @Autowired
    private GlobalExceptionHandler globalExceptionHandler;

    @Autowired
    private JwtExceptionHandler jwtExceptionHandler;

    /**
     * Test {@link DayPlanController#createDayPlan(DayPlanCreateRequestDto)}.
     * <p>
     * Method under test: {@link DayPlanController#createDayPlan(DayPlanCreateRequestDto)}
     */
    @Test
    @DisplayName("Test createDayPlan(DayPlanCreateRequestDto)")
    @Disabled("TODO: Complete this test")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({"ResponseEntity DayPlanController.createDayPlan(DayPlanCreateRequestDto)"})
    void testCreateDayPlan() throws Exception {
        // TODO: Diffblue Cover was only able to create a partial test for this method:
        //   Reason: No inputs found that don't throw a trivial exception.
        //   Diffblue Cover tried to run the arrange/act section, but the method under
        //   test threw
        //   com.fasterxml.jackson.databind.exc.InvalidDefinitionException: Java 8 date/time type `java.time.LocalDate` not supported by default: add Module "com.fasterxml.jackson.datatype:jackson-datatype-jsr310" to enable handling (through reference chain: com.devs.roamance.dto.request.travel.itinerary.DayPlanCreateRequestDto["date"])
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
        DayPlanCreateRequestDto dayPlanCreateRequestDto = new DayPlanCreateRequestDto();
        dayPlanCreateRequestDto.setDate(LocalDate.of(1970, 1, 1));
        dayPlanCreateRequestDto.setItineraryId(UUID.randomUUID());
        dayPlanCreateRequestDto.setNotes(new ArrayList<>());
        dayPlanCreateRequestDto.setRoutePlan(new RoutePlanRequestDto());
        String content = (new ObjectMapper()).writeValueAsString(dayPlanCreateRequestDto);
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.post("/travel/day-plans")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content);

        // Act
        MockMvcBuilders.standaloneSetup(dayPlanController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder);
    }

    /**
     * Test {@link DayPlanController#createDayPlan(DayPlanCreateRequestDto)}.
     * <ul>
     *   <li>Then StatusCode return {@link HttpStatus}.</li>
     * </ul>
     * <p>
     * Method under test: {@link DayPlanController#createDayPlan(DayPlanCreateRequestDto)}
     */
    @Test
    @DisplayName("Test createDayPlan(DayPlanCreateRequestDto); then StatusCode return HttpStatus")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({"ResponseEntity DayPlanController.createDayPlan(DayPlanCreateRequestDto)"})
    void testCreateDayPlan_thenStatusCodeReturnHttpStatus() {
        //   Diffblue Cover was unable to create a Spring-specific test for this Spring method.
        //   Run dcover create --keep-partial-tests to gain insights into why
        //   a non-Spring test was created.

        // Arrange
        DayPlanService dayPlanService = mock(DayPlanService.class);
        DayPlanResponseDto dayPlanResponseDto = new DayPlanResponseDto();
        when(dayPlanService.create(Mockito.<DayPlanCreateRequestDto>any())).thenReturn(dayPlanResponseDto);
        DayPlanController dayPlanController = new DayPlanController(dayPlanService);

        // Act
        ResponseEntity<DayPlanResponseDto> actualCreateDayPlanResult = dayPlanController
                .createDayPlan(new DayPlanCreateRequestDto());

        // Assert
        verify(dayPlanService).create(isA(DayPlanCreateRequestDto.class));
        HttpStatusCode statusCode = actualCreateDayPlanResult.getStatusCode();
        assertTrue(statusCode instanceof HttpStatus);
        assertEquals(201, actualCreateDayPlanResult.getStatusCodeValue());
        assertEquals(HttpStatus.CREATED, statusCode);
        assertTrue(actualCreateDayPlanResult.hasBody());
        assertTrue(actualCreateDayPlanResult.getHeaders().isEmpty());
        assertSame(dayPlanResponseDto, actualCreateDayPlanResult.getBody());
    }

    /**
     * Test {@link DayPlanController#getDayPlanById(UUID)}.
     * <p>
     * Method under test: {@link DayPlanController#getDayPlanById(UUID)}
     */
    @Test
    @DisplayName("Test getDayPlanById(UUID)")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({"ResponseEntity DayPlanController.getDayPlanById(UUID)"})
    void testGetDayPlanById() throws Exception {
        // Arrange
        when(dayPlanService.get(Mockito.<UUID>any())).thenReturn(new DayPlanResponseDto());
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.get("/travel/day-plans/{dayPlanId}",
                UUID.randomUUID());

        // Act and Assert
        MockMvcBuilders.standaloneSetup(dayPlanController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(
                        MockMvcResultMatchers.content().string("{\"status\":0,\"success\":false,\"message\":null,\"data\":null}"));
    }

    /**
     * Test {@link DayPlanController#getDayPlansByItineraryId(UUID, int, int, String, String)}.
     * <p>
     * Method under test: {@link DayPlanController#getDayPlansByItineraryId(UUID, int, int, String, String)}
     */
    @Test
    @DisplayName("Test getDayPlansByItineraryId(UUID, int, int, String, String)")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({"ResponseEntity DayPlanController.getDayPlansByItineraryId(UUID, int, int, String, String)"})
    void testGetDayPlansByItineraryId() throws Exception {
        // Arrange
        when(dayPlanService.getByItineraryId(Mockito.<UUID>any(), anyInt(), anyInt(), Mockito.<String>any(),
                Mockito.<String>any())).thenReturn(new DayPlanListResponseDto());
        MockHttpServletRequestBuilder getResult = MockMvcRequestBuilders.get("/travel/day-plans/itinerary/{itineraryId}",
                UUID.randomUUID());
        MockHttpServletRequestBuilder paramResult = getResult.param("pageNumber", String.valueOf(1));
        MockHttpServletRequestBuilder requestBuilder = paramResult.param("pageSize", String.valueOf(1))
                .param("sortBy", "foo")
                .param("sortDir", "foo");

        // Act and Assert
        MockMvcBuilders.standaloneSetup(dayPlanController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(
                        MockMvcResultMatchers.content().string("{\"status\":0,\"success\":false,\"message\":null,\"data\":[]}"));
    }

    /**
     * Test {@link DayPlanController#updateDayPlan(UUID, DayPlanUpdateRequestDto)}.
     * <ul>
     *   <li>Then status {@link StatusResultMatchers#isOk()}.</li>
     * </ul>
     * <p>
     * Method under test: {@link DayPlanController#updateDayPlan(UUID, DayPlanUpdateRequestDto)}
     */
    @Test
    @DisplayName("Test updateDayPlan(UUID, DayPlanUpdateRequestDto); then status isOk()")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({"ResponseEntity DayPlanController.updateDayPlan(UUID, DayPlanUpdateRequestDto)"})
    void testUpdateDayPlan_thenStatusIsOk() throws Exception {
        // Arrange
        when(dayPlanService.update(Mockito.<DayPlanUpdateRequestDto>any(), Mockito.<UUID>any()))
                .thenReturn(new DayPlanResponseDto());

        DayPlanUpdateRequestDto dayPlanUpdateRequestDto = new DayPlanUpdateRequestDto();
        dayPlanUpdateRequestDto.setDate(null);
        dayPlanUpdateRequestDto.setNotes(new ArrayList<>());
        dayPlanUpdateRequestDto.setRoutePlan(new RoutePlanRequestDto());
        String content = (new ObjectMapper()).writeValueAsString(dayPlanUpdateRequestDto);
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders
                .put("/travel/day-plans/{dayPlanId}", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(content);

        // Act and Assert
        MockMvcBuilders.standaloneSetup(dayPlanController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(
                        MockMvcResultMatchers.content().string("{\"status\":0,\"success\":false,\"message\":null,\"data\":null}"));
    }

    /**
     * Test {@link DayPlanController#deleteDayPlan(UUID)}.
     * <p>
     * Method under test: {@link DayPlanController#deleteDayPlan(UUID)}
     */
    @Test
    @DisplayName("Test deleteDayPlan(UUID)")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({"ResponseEntity DayPlanController.deleteDayPlan(UUID)"})
    void testDeleteDayPlan() throws Exception {
        // Arrange
        when(dayPlanService.delete(Mockito.<UUID>any()))
                .thenReturn(new BaseResponseDto(1, true, "Not all who wander are lost"));
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.delete("/travel/day-plans/{dayPlanId}",
                UUID.randomUUID());

        // Act and Assert
        MockMvcBuilders.standaloneSetup(dayPlanController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(MockMvcResultMatchers.content()
                        .string("{\"status\":1,\"success\":true,\"message\":\"Not all who wander are lost\"}"));
    }
}
