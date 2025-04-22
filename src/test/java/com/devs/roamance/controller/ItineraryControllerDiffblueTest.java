package com.devs.roamance.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.anyInt;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.devs.roamance.dto.request.travel.itinerary.ItineraryCreateRequestDto;
import com.devs.roamance.dto.request.travel.itinerary.ItineraryUpdateRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.travel.itinerary.ItineraryListResponseDto;
import com.devs.roamance.dto.response.travel.itinerary.ItineraryResponseDto;
import com.devs.roamance.exception.handler.GlobalExceptionHandler;
import com.devs.roamance.exception.handler.JwtExceptionHandler;
import com.devs.roamance.model.travel.itinerary.Itinerary;
import com.devs.roamance.model.user.User;
import com.devs.roamance.model.user.UserInfo;
import com.devs.roamance.model.user.preference.BudgetLevel;
import com.devs.roamance.model.user.preference.ClimatePreference;
import com.devs.roamance.model.user.preference.TravelStyle;
import com.devs.roamance.model.user.preference.UserPreferences;
import com.devs.roamance.repository.ItineraryRepository;
import com.devs.roamance.service.ItineraryService;
import com.devs.roamance.service.impl.ItineraryServiceImpl;
import com.devs.roamance.util.UserUtil;
import com.diffblue.cover.annotations.MethodsUnderTest;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.UUID;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.modelmapper.ModelMapper;
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

@ContextConfiguration(classes = {ItineraryController.class, GlobalExceptionHandler.class, JwtExceptionHandler.class})
@ExtendWith(SpringExtension.class)
@DisabledInAotMode
class ItineraryControllerDiffblueTest {
    @Autowired
    private GlobalExceptionHandler globalExceptionHandler;

    @Autowired
    private ItineraryController itineraryController;

    @MockitoBean
    private ItineraryService itineraryService;

    @Autowired
    private JwtExceptionHandler jwtExceptionHandler;

    /**
     * Test {@link ItineraryController#createItinerary(ItineraryCreateRequestDto)}.
     * <p>
     * Method under test: {@link ItineraryController#createItinerary(ItineraryCreateRequestDto)}
     */
    @Test
    @DisplayName("Test createItinerary(ItineraryCreateRequestDto)")
    @Disabled("TODO: Complete this test")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({"ResponseEntity ItineraryController.createItinerary(ItineraryCreateRequestDto)"})
    void testCreateItinerary() throws Exception {
        // TODO: Diffblue Cover was only able to create a partial test for this method:
        //   Reason: No inputs found that don't throw a trivial exception.
        //   Diffblue Cover tried to run the arrange/act section, but the method under
        //   test threw
        //   com.fasterxml.jackson.databind.exc.InvalidDefinitionException: Java 8 date/time type `java.time.LocalDate` not supported by default: add Module "com.fasterxml.jackson.datatype:jackson-datatype-jsr310" to enable handling (through reference chain: com.devs.roamance.dto.request.travel.itinerary.ItineraryCreateRequestDto["start_date"])
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
        ItineraryCreateRequestDto itineraryCreateRequestDto = new ItineraryCreateRequestDto();
        itineraryCreateRequestDto.setDescription("The characteristics of someone or something");
        itineraryCreateRequestDto.setEndDate(LocalDate.of(1970, 1, 1));
        itineraryCreateRequestDto.setLocations(new HashSet<>());
        itineraryCreateRequestDto.setNotes(new ArrayList<>());
        itineraryCreateRequestDto.setStartDate(LocalDate.of(1970, 1, 1));
        itineraryCreateRequestDto.setTitle("Dr");
        String content = (new ObjectMapper()).writeValueAsString(itineraryCreateRequestDto);
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.post("/travel/itineraries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content);

        // Act
        MockMvcBuilders.standaloneSetup(itineraryController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder);
    }

    /**
     * Test {@link ItineraryController#createItinerary(ItineraryCreateRequestDto)}.
     * <ul>
     *   <li>Given {@link UserInfo#UserInfo()} Bio is {@code Bio}.</li>
     *   <li>Then StatusCode return {@link HttpStatus}.</li>
     * </ul>
     * <p>
     * Method under test: {@link ItineraryController#createItinerary(ItineraryCreateRequestDto)}
     */
    @Test
    @DisplayName("Test createItinerary(ItineraryCreateRequestDto); given UserInfo() Bio is 'Bio'; then StatusCode return HttpStatus")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({"ResponseEntity ItineraryController.createItinerary(ItineraryCreateRequestDto)"})
    void testCreateItinerary_givenUserInfoBioIsBio_thenStatusCodeReturnHttpStatus() {
        //   Diffblue Cover was unable to create a Spring-specific test for this Spring method.
        //   Run dcover create --keep-partial-tests to gain insights into why
        //   a non-Spring test was created.

        // Arrange
        UserInfo info = new UserInfo();
        info.setBio("Bio");
        info.setBirthday(LocalDate.of(1970, 1, 1));
        info.setCoverImage("Cover Image");
        info.setCreatedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        info.setId(UUID.randomUUID());
        info.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        info.setLocation("Location");
        info.setPhone("6625550144");
        info.setProfileImage("Profile Image");
        info.setUser(new User());

        UserPreferences preferences = new UserPreferences();
        preferences.setAccommodationTypes(new HashSet<>());
        preferences.setActivityTypes(new HashSet<>());
        preferences.setBudgetLevel(BudgetLevel.BUDGET);
        preferences.setClimatePreference(ClimatePreference.WARM_AND_SUNNY);
        preferences.setCuisineTypes(new HashSet<>());
        preferences.setId(UUID.randomUUID());
        preferences.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        preferences.setLastModifiedBy(UUID.randomUUID());
        preferences.setTravelStyle(TravelStyle.RELAXED);
        preferences.setUser(new User());

        User user = new User();
        user.setActivities(new ArrayList<>());
        user.setChats(new ArrayList<>());
        user.setComments(new ArrayList<>());
        user.setCreatedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user.setDayPlans(new ArrayList<>());
        user.setEmail("jane.doe@example.org");
        user.setId(UUID.randomUUID());
        user.setInfo(info);
        user.setItineraries(new ArrayList<>());
        user.setJournals(new ArrayList<>());
        user.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user.setLikedPosts(new HashSet<>());
        user.setMessages(new ArrayList<>());
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setPosts(new ArrayList<>());
        user.setPreferences(preferences);
        user.setRoles(new HashSet<>());
        user.setSavedPosts(new HashSet<>());

        UserInfo info2 = new UserInfo();
        info2.setBio("Bio");
        info2.setBirthday(LocalDate.of(1970, 1, 1));
        info2.setCoverImage("Cover Image");
        info2.setCreatedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        info2.setId(UUID.randomUUID());
        info2.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        info2.setLocation("Location");
        info2.setPhone("6625550144");
        info2.setProfileImage("Profile Image");
        info2.setUser(user);

        UserInfo info3 = new UserInfo();
        info3.setBio("Bio");
        info3.setBirthday(LocalDate.of(1970, 1, 1));
        info3.setCoverImage("Cover Image");
        info3.setCreatedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        info3.setId(UUID.randomUUID());
        info3.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        info3.setLocation("Location");
        info3.setPhone("6625550144");
        info3.setProfileImage("Profile Image");
        info3.setUser(new User());

        UserPreferences preferences2 = new UserPreferences();
        preferences2.setAccommodationTypes(new HashSet<>());
        preferences2.setActivityTypes(new HashSet<>());
        preferences2.setBudgetLevel(BudgetLevel.BUDGET);
        preferences2.setClimatePreference(ClimatePreference.WARM_AND_SUNNY);
        preferences2.setCuisineTypes(new HashSet<>());
        preferences2.setId(UUID.randomUUID());
        preferences2.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        preferences2.setLastModifiedBy(UUID.randomUUID());
        preferences2.setTravelStyle(TravelStyle.RELAXED);
        preferences2.setUser(new User());

        User user2 = new User();
        user2.setActivities(new ArrayList<>());
        user2.setChats(new ArrayList<>());
        user2.setComments(new ArrayList<>());
        user2.setCreatedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user2.setDayPlans(new ArrayList<>());
        user2.setEmail("jane.doe@example.org");
        user2.setId(UUID.randomUUID());
        user2.setInfo(info3);
        user2.setItineraries(new ArrayList<>());
        user2.setJournals(new ArrayList<>());
        user2.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user2.setLikedPosts(new HashSet<>());
        user2.setMessages(new ArrayList<>());
        user2.setName("Name");
        user2.setPassword("iloveyou");
        user2.setPosts(new ArrayList<>());
        user2.setPreferences(preferences2);
        user2.setRoles(new HashSet<>());
        user2.setSavedPosts(new HashSet<>());

        UserPreferences preferences3 = new UserPreferences();
        preferences3.setAccommodationTypes(new HashSet<>());
        preferences3.setActivityTypes(new HashSet<>());
        preferences3.setBudgetLevel(BudgetLevel.BUDGET);
        preferences3.setClimatePreference(ClimatePreference.WARM_AND_SUNNY);
        preferences3.setCuisineTypes(new HashSet<>());
        preferences3.setId(UUID.randomUUID());
        preferences3.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        preferences3.setLastModifiedBy(UUID.randomUUID());
        preferences3.setTravelStyle(TravelStyle.RELAXED);
        preferences3.setUser(user2);

        User user3 = new User();
        user3.setActivities(new ArrayList<>());
        user3.setChats(new ArrayList<>());
        user3.setComments(new ArrayList<>());
        user3.setCreatedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user3.setDayPlans(new ArrayList<>());
        user3.setEmail("jane.doe@example.org");
        user3.setId(UUID.randomUUID());
        user3.setInfo(info2);
        user3.setItineraries(new ArrayList<>());
        user3.setJournals(new ArrayList<>());
        user3.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user3.setLikedPosts(new HashSet<>());
        user3.setMessages(new ArrayList<>());
        user3.setName("Name");
        user3.setPassword("iloveyou");
        user3.setPosts(new ArrayList<>());
        user3.setPreferences(preferences3);
        user3.setRoles(new HashSet<>());
        user3.setSavedPosts(new HashSet<>());

        Itinerary itinerary = new Itinerary();
        itinerary.setDayPlans(new ArrayList<>());
        itinerary.setDescription("The characteristics of someone or something");
        itinerary.setEndDate(LocalDate.of(1970, 1, 1));
        itinerary.setId(UUID.randomUUID());
        itinerary.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        itinerary.setLastModifiedBy(UUID.randomUUID());
        itinerary.setLocations(new HashSet<>());
        itinerary.setNotes(new ArrayList<>());
        itinerary.setStartDate(LocalDate.of(1970, 1, 1));
        itinerary.setTitle("Dr");
        itinerary.setTotalCost(new BigDecimal("2.3"));
        itinerary.setUser(user3);
        ItineraryRepository itineraryRepository = mock(ItineraryRepository.class);
        when(itineraryRepository.save(Mockito.<Itinerary>any())).thenReturn(itinerary);
        doNothing().when(itineraryRepository).flush();

        User user4 = new User();
        user4.setActivities(new ArrayList<>());
        user4.setChats(new ArrayList<>());
        user4.setComments(new ArrayList<>());
        user4.setCreatedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user4.setDayPlans(new ArrayList<>());
        user4.setEmail("jane.doe@example.org");
        user4.setId(UUID.randomUUID());
        user4.setInfo(new UserInfo());
        user4.setItineraries(new ArrayList<>());
        user4.setJournals(new ArrayList<>());
        user4.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user4.setLikedPosts(new HashSet<>());
        user4.setMessages(new ArrayList<>());
        user4.setName("Name");
        user4.setPassword("iloveyou");
        user4.setPosts(new ArrayList<>());
        user4.setPreferences(new UserPreferences());
        user4.setRoles(new HashSet<>());
        user4.setSavedPosts(new HashSet<>());

        UserInfo info4 = new UserInfo();
        info4.setBio("Bio");
        info4.setBirthday(LocalDate.of(1970, 1, 1));
        info4.setCoverImage("Cover Image");
        info4.setCreatedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        info4.setId(UUID.randomUUID());
        info4.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        info4.setLocation("Location");
        info4.setPhone("6625550144");
        info4.setProfileImage("Profile Image");
        info4.setUser(user4);

        User user5 = new User();
        user5.setActivities(new ArrayList<>());
        user5.setChats(new ArrayList<>());
        user5.setComments(new ArrayList<>());
        user5.setCreatedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user5.setDayPlans(new ArrayList<>());
        user5.setEmail("jane.doe@example.org");
        user5.setId(UUID.randomUUID());
        user5.setInfo(new UserInfo());
        user5.setItineraries(new ArrayList<>());
        user5.setJournals(new ArrayList<>());
        user5.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user5.setLikedPosts(new HashSet<>());
        user5.setMessages(new ArrayList<>());
        user5.setName("Name");
        user5.setPassword("iloveyou");
        user5.setPosts(new ArrayList<>());
        user5.setPreferences(new UserPreferences());
        user5.setRoles(new HashSet<>());
        user5.setSavedPosts(new HashSet<>());

        UserPreferences preferences4 = new UserPreferences();
        preferences4.setAccommodationTypes(new HashSet<>());
        preferences4.setActivityTypes(new HashSet<>());
        preferences4.setBudgetLevel(BudgetLevel.BUDGET);
        preferences4.setClimatePreference(ClimatePreference.WARM_AND_SUNNY);
        preferences4.setCuisineTypes(new HashSet<>());
        preferences4.setId(UUID.randomUUID());
        preferences4.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        preferences4.setLastModifiedBy(UUID.randomUUID());
        preferences4.setTravelStyle(TravelStyle.RELAXED);
        preferences4.setUser(user5);

        User user6 = new User();
        user6.setActivities(new ArrayList<>());
        user6.setChats(new ArrayList<>());
        user6.setComments(new ArrayList<>());
        user6.setCreatedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user6.setDayPlans(new ArrayList<>());
        user6.setEmail("jane.doe@example.org");
        user6.setId(UUID.randomUUID());
        user6.setInfo(info4);
        user6.setItineraries(new ArrayList<>());
        user6.setJournals(new ArrayList<>());
        user6.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user6.setLikedPosts(new HashSet<>());
        user6.setMessages(new ArrayList<>());
        user6.setName("Name");
        user6.setPassword("iloveyou");
        user6.setPosts(new ArrayList<>());
        user6.setPreferences(preferences4);
        user6.setRoles(new HashSet<>());
        user6.setSavedPosts(new HashSet<>());

        UserInfo info5 = new UserInfo();
        info5.setBio("Bio");
        info5.setBirthday(LocalDate.of(1970, 1, 1));
        info5.setCoverImage("Cover Image");
        info5.setCreatedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        info5.setId(UUID.randomUUID());
        info5.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        info5.setLocation("Location");
        info5.setPhone("6625550144");
        info5.setProfileImage("Profile Image");
        info5.setUser(user6);

        User user7 = new User();
        user7.setActivities(new ArrayList<>());
        user7.setChats(new ArrayList<>());
        user7.setComments(new ArrayList<>());
        user7.setCreatedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user7.setDayPlans(new ArrayList<>());
        user7.setEmail("jane.doe@example.org");
        user7.setId(UUID.randomUUID());
        user7.setInfo(new UserInfo());
        user7.setItineraries(new ArrayList<>());
        user7.setJournals(new ArrayList<>());
        user7.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user7.setLikedPosts(new HashSet<>());
        user7.setMessages(new ArrayList<>());
        user7.setName("Name");
        user7.setPassword("iloveyou");
        user7.setPosts(new ArrayList<>());
        user7.setPreferences(new UserPreferences());
        user7.setRoles(new HashSet<>());
        user7.setSavedPosts(new HashSet<>());

        UserInfo info6 = new UserInfo();
        info6.setBio("Bio");
        info6.setBirthday(LocalDate.of(1970, 1, 1));
        info6.setCoverImage("Cover Image");
        info6.setCreatedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        info6.setId(UUID.randomUUID());
        info6.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        info6.setLocation("Location");
        info6.setPhone("6625550144");
        info6.setProfileImage("Profile Image");
        info6.setUser(user7);

        User user8 = new User();
        user8.setActivities(new ArrayList<>());
        user8.setChats(new ArrayList<>());
        user8.setComments(new ArrayList<>());
        user8.setCreatedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user8.setDayPlans(new ArrayList<>());
        user8.setEmail("jane.doe@example.org");
        user8.setId(UUID.randomUUID());
        user8.setInfo(new UserInfo());
        user8.setItineraries(new ArrayList<>());
        user8.setJournals(new ArrayList<>());
        user8.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user8.setLikedPosts(new HashSet<>());
        user8.setMessages(new ArrayList<>());
        user8.setName("Name");
        user8.setPassword("iloveyou");
        user8.setPosts(new ArrayList<>());
        user8.setPreferences(new UserPreferences());
        user8.setRoles(new HashSet<>());
        user8.setSavedPosts(new HashSet<>());

        UserPreferences preferences5 = new UserPreferences();
        preferences5.setAccommodationTypes(new HashSet<>());
        preferences5.setActivityTypes(new HashSet<>());
        preferences5.setBudgetLevel(BudgetLevel.BUDGET);
        preferences5.setClimatePreference(ClimatePreference.WARM_AND_SUNNY);
        preferences5.setCuisineTypes(new HashSet<>());
        preferences5.setId(UUID.randomUUID());
        preferences5.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        preferences5.setLastModifiedBy(UUID.randomUUID());
        preferences5.setTravelStyle(TravelStyle.RELAXED);
        preferences5.setUser(user8);

        User user9 = new User();
        user9.setActivities(new ArrayList<>());
        user9.setChats(new ArrayList<>());
        user9.setComments(new ArrayList<>());
        user9.setCreatedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user9.setDayPlans(new ArrayList<>());
        user9.setEmail("jane.doe@example.org");
        user9.setId(UUID.randomUUID());
        user9.setInfo(info6);
        user9.setItineraries(new ArrayList<>());
        user9.setJournals(new ArrayList<>());
        user9.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user9.setLikedPosts(new HashSet<>());
        user9.setMessages(new ArrayList<>());
        user9.setName("Name");
        user9.setPassword("iloveyou");
        user9.setPosts(new ArrayList<>());
        user9.setPreferences(preferences5);
        user9.setRoles(new HashSet<>());
        user9.setSavedPosts(new HashSet<>());

        UserPreferences preferences6 = new UserPreferences();
        preferences6.setAccommodationTypes(new HashSet<>());
        preferences6.setActivityTypes(new HashSet<>());
        preferences6.setBudgetLevel(BudgetLevel.BUDGET);
        preferences6.setClimatePreference(ClimatePreference.WARM_AND_SUNNY);
        preferences6.setCuisineTypes(new HashSet<>());
        preferences6.setId(UUID.randomUUID());
        preferences6.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        preferences6.setLastModifiedBy(UUID.randomUUID());
        preferences6.setTravelStyle(TravelStyle.RELAXED);
        preferences6.setUser(user9);

        User user10 = new User();
        user10.setActivities(new ArrayList<>());
        user10.setChats(new ArrayList<>());
        user10.setComments(new ArrayList<>());
        user10.setCreatedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user10.setDayPlans(new ArrayList<>());
        user10.setEmail("jane.doe@example.org");
        user10.setId(UUID.randomUUID());
        user10.setInfo(info5);
        user10.setItineraries(new ArrayList<>());
        user10.setJournals(new ArrayList<>());
        user10.setLastModifiedAt(OffsetDateTime.of(LocalDate.of(1970, 1, 1), LocalTime.MIDNIGHT, ZoneOffset.UTC));
        user10.setLikedPosts(new HashSet<>());
        user10.setMessages(new ArrayList<>());
        user10.setName("Name");
        user10.setPassword("iloveyou");
        user10.setPosts(new ArrayList<>());
        user10.setPreferences(preferences6);
        user10.setRoles(new HashSet<>());
        user10.setSavedPosts(new HashSet<>());
        UserUtil userUtil = mock(UserUtil.class);
        when(userUtil.getAuthenticatedUser()).thenReturn(user10);
        ItineraryController itineraryController = new ItineraryController(
                new ItineraryServiceImpl(itineraryRepository, new ModelMapper(), userUtil));

        // Act
        ResponseEntity<ItineraryResponseDto> actualCreateItineraryResult = itineraryController
                .createItinerary(new ItineraryCreateRequestDto());

        // Assert
        verify(userUtil).getAuthenticatedUser();
        verify(itineraryRepository).flush();
        verify(itineraryRepository).save(isA(Itinerary.class));
        HttpStatusCode statusCode = actualCreateItineraryResult.getStatusCode();
        assertTrue(statusCode instanceof HttpStatus);
        ItineraryResponseDto body = actualCreateItineraryResult.getBody();
        assertEquals("Itinerary created successfully.", body.getMessage());
        assertEquals(201, body.getStatus());
        assertEquals(201, actualCreateItineraryResult.getStatusCodeValue());
        assertEquals(HttpStatus.CREATED, statusCode);
        assertTrue(body.isSuccess());
        assertTrue(actualCreateItineraryResult.hasBody());
        assertTrue(actualCreateItineraryResult.getHeaders().isEmpty());
    }

    /**
     * Test {@link ItineraryController#getAllItineraries(int, int, String, String)}.
     * <p>
     * Method under test: {@link ItineraryController#getAllItineraries(int, int, String, String)}
     */
    @Test
    @DisplayName("Test getAllItineraries(int, int, String, String)")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({"ResponseEntity ItineraryController.getAllItineraries(int, int, String, String)"})
    void testGetAllItineraries() throws Exception {
        // Arrange
        when(itineraryService.getAll(anyInt(), anyInt(), Mockito.<String>any(), Mockito.<String>any()))
                .thenReturn(new ItineraryListResponseDto());
        MockHttpServletRequestBuilder getResult = MockMvcRequestBuilders.get("/travel/itineraries");
        MockHttpServletRequestBuilder paramResult = getResult.param("pageNumber", String.valueOf(1));
        MockHttpServletRequestBuilder requestBuilder = paramResult.param("pageSize", String.valueOf(1))
                .param("sortBy", "foo")
                .param("sortDir", "foo");

        // Act and Assert
        MockMvcBuilders.standaloneSetup(itineraryController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(
                        MockMvcResultMatchers.content().string("{\"status\":0,\"success\":false,\"message\":null,\"data\":[]}"));
    }

    /**
     * Test {@link ItineraryController#getItineraryById(UUID)}.
     * <p>
     * Method under test: {@link ItineraryController#getItineraryById(UUID)}
     */
    @Test
    @DisplayName("Test getItineraryById(UUID)")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({"ResponseEntity ItineraryController.getItineraryById(UUID)"})
    void testGetItineraryById() throws Exception {
        // Arrange
        when(itineraryService.get(Mockito.<UUID>any())).thenReturn(new ItineraryResponseDto());
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.get("/travel/itineraries/{itineraryId}",
                UUID.randomUUID());

        // Act and Assert
        MockMvcBuilders.standaloneSetup(itineraryController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(
                        MockMvcResultMatchers.content().string("{\"status\":0,\"success\":false,\"message\":null,\"data\":null}"));
    }

    /**
     * Test {@link ItineraryController#getItinerariesByUserId(UUID, int, int, String, String)}.
     * <p>
     * Method under test: {@link ItineraryController#getItinerariesByUserId(UUID, int, int, String, String)}
     */
    @Test
    @DisplayName("Test getItinerariesByUserId(UUID, int, int, String, String)")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({"ResponseEntity ItineraryController.getItinerariesByUserId(UUID, int, int, String, String)"})
    void testGetItinerariesByUserId() throws Exception {
        // Arrange
        when(itineraryService.getByUserId(Mockito.<UUID>any(), anyInt(), anyInt(), Mockito.<String>any(),
                Mockito.<String>any())).thenReturn(new ItineraryListResponseDto());
        MockHttpServletRequestBuilder getResult = MockMvcRequestBuilders.get("/travel/itineraries/user/{userId}",
                UUID.randomUUID());
        MockHttpServletRequestBuilder paramResult = getResult.param("pageNumber", String.valueOf(1));
        MockHttpServletRequestBuilder requestBuilder = paramResult.param("pageSize", String.valueOf(1))
                .param("sortBy", "foo")
                .param("sortDir", "foo");

        // Act and Assert
        MockMvcBuilders.standaloneSetup(itineraryController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(
                        MockMvcResultMatchers.content().string("{\"status\":0,\"success\":false,\"message\":null,\"data\":[]}"));
    }

    /**
     * Test {@link ItineraryController#updateItinerary(UUID, ItineraryUpdateRequestDto)}.
     * <p>
     * Method under test: {@link ItineraryController#updateItinerary(UUID, ItineraryUpdateRequestDto)}
     */
    @Test
    @DisplayName("Test updateItinerary(UUID, ItineraryUpdateRequestDto)")
    @Disabled("TODO: Complete this test")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({"ResponseEntity ItineraryController.updateItinerary(UUID, ItineraryUpdateRequestDto)"})
    void testUpdateItinerary() throws Exception {
        // TODO: Diffblue Cover was only able to create a partial test for this method:
        //   Reason: No inputs found that don't throw a trivial exception.
        //   Diffblue Cover tried to run the arrange/act section, but the method under
        //   test threw
        //   com.fasterxml.jackson.databind.exc.InvalidDefinitionException: Java 8 date/time type `java.time.LocalDate` not supported by default: add Module "com.fasterxml.jackson.datatype:jackson-datatype-jsr310" to enable handling (through reference chain: com.devs.roamance.dto.request.travel.itinerary.ItineraryUpdateRequestDto["start_date"])
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
        ItineraryUpdateRequestDto itineraryUpdateRequestDto = new ItineraryUpdateRequestDto();
        itineraryUpdateRequestDto.setDescription("The characteristics of someone or something");
        itineraryUpdateRequestDto.setEndDate(LocalDate.of(1970, 1, 1));
        itineraryUpdateRequestDto.setLocations(new HashSet<>());
        itineraryUpdateRequestDto.setNotes(new ArrayList<>());
        itineraryUpdateRequestDto.setStartDate(LocalDate.of(1970, 1, 1));
        itineraryUpdateRequestDto.setTitle("Dr");
        String content = (new ObjectMapper()).writeValueAsString(itineraryUpdateRequestDto);
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders
                .put("/travel/itineraries/{itineraryId}", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(content);

        // Act
        MockMvcBuilders.standaloneSetup(itineraryController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder);
    }

    /**
     * Test {@link ItineraryController#updateItinerary(UUID, ItineraryUpdateRequestDto)}.
     * <ul>
     *   <li>Then StatusCode return {@link HttpStatus}.</li>
     * </ul>
     * <p>
     * Method under test: {@link ItineraryController#updateItinerary(UUID, ItineraryUpdateRequestDto)}
     */
    @Test
    @DisplayName("Test updateItinerary(UUID, ItineraryUpdateRequestDto); then StatusCode return HttpStatus")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({"ResponseEntity ItineraryController.updateItinerary(UUID, ItineraryUpdateRequestDto)"})
    void testUpdateItinerary_thenStatusCodeReturnHttpStatus() {
        //   Diffblue Cover was unable to create a Spring-specific test for this Spring method.
        //   Run dcover create --keep-partial-tests to gain insights into why
        //   a non-Spring test was created.

        // Arrange
        ItineraryService itineraryService = mock(ItineraryService.class);
        ItineraryResponseDto itineraryResponseDto = new ItineraryResponseDto();
        when(itineraryService.update(Mockito.<ItineraryUpdateRequestDto>any(), Mockito.<UUID>any()))
                .thenReturn(itineraryResponseDto);
        ItineraryController itineraryController = new ItineraryController(itineraryService);
        UUID itineraryId = UUID.randomUUID();

        // Act
        ResponseEntity<ItineraryResponseDto> actualUpdateItineraryResult = itineraryController.updateItinerary(itineraryId,
                new ItineraryUpdateRequestDto());

        // Assert
        verify(itineraryService).update(isA(ItineraryUpdateRequestDto.class), isA(UUID.class));
        HttpStatusCode statusCode = actualUpdateItineraryResult.getStatusCode();
        assertTrue(statusCode instanceof HttpStatus);
        assertEquals(200, actualUpdateItineraryResult.getStatusCodeValue());
        assertEquals(HttpStatus.OK, statusCode);
        assertTrue(actualUpdateItineraryResult.hasBody());
        assertTrue(actualUpdateItineraryResult.getHeaders().isEmpty());
        assertSame(itineraryResponseDto, actualUpdateItineraryResult.getBody());
    }

    /**
     * Test {@link ItineraryController#deleteItinerary(UUID)}.
     * <p>
     * Method under test: {@link ItineraryController#deleteItinerary(UUID)}
     */
    @Test
    @DisplayName("Test deleteItinerary(UUID)")
    @Tag("MaintainedByDiffblue")
    @MethodsUnderTest({"ResponseEntity ItineraryController.deleteItinerary(UUID)"})
    void testDeleteItinerary() throws Exception {
        // Arrange
        when(itineraryService.delete(Mockito.<UUID>any()))
                .thenReturn(new BaseResponseDto(1, true, "Not all who wander are lost"));
        MockHttpServletRequestBuilder requestBuilder = MockMvcRequestBuilders.delete("/travel/itineraries/{itineraryId}",
                UUID.randomUUID());

        // Act and Assert
        MockMvcBuilders.standaloneSetup(itineraryController)
                .setControllerAdvice(globalExceptionHandler, jwtExceptionHandler)
                .build()
                .perform(requestBuilder)
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(MockMvcResultMatchers.content()
                        .string("{\"status\":1,\"success\":true,\"message\":\"Not all who wander are lost\"}"));
    }
}
