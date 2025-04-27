package com.devs.roamance.util;

import com.devs.roamance.dto.common.AiPoweredActivityDto;
import com.devs.roamance.dto.common.AiPoweredDayPlanDto;
import com.devs.roamance.dto.common.AiPoweredItineraryDto;
import com.devs.roamance.model.travel.Location;
import com.devs.roamance.model.travel.itinerary.Activity;
import com.devs.roamance.model.travel.itinerary.DayPlan;
import com.devs.roamance.model.travel.itinerary.Itinerary;
import com.devs.roamance.model.user.User;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class ItineraryUtil {

  private final ActivityUtil activityUtil;
  private final ModelMapper modelMapper;

  public ItineraryUtil(ActivityUtil activityUtil, ModelMapper modelMapper) {
    this.activityUtil = activityUtil;
    this.modelMapper = modelMapper;
  }

  public void validateDayPlansAndActivities(Itinerary itinerary) {

    for (DayPlan dayPlan : itinerary.getDayPlans()) {

      itinerary.validateDayPlanDate(dayPlan);

      for (Activity activity : dayPlan.getActivities()) {

        dayPlan.validateNoTimeCollisions(activity);
        activity.setId(null); // clear before persisting
      }
    }
  }

  public void mapToDayPlansAndActivities(
      Itinerary itinerary, AiPoweredItineraryDto itineraryDto, User user) {

    itinerary.setUser(user);
    itinerary.setTitle(itineraryDto.getTitle());
    itinerary.setDescription(itineraryDto.getDescription());
    itinerary.setStartDate(itineraryDto.getStartDate());
    itinerary.setEndDate(itineraryDto.getEndDate());
    itinerary.setNotes(itineraryDto.getNotes());
    itineraryDto
        .getLocations()
        .forEach(
            location -> {
              Location newLocation = modelMapper.map(location, Location.class);
              itinerary.getLocations().add(newLocation);
            });

    List<DayPlan> dayPlans = new ArrayList<>();
    for (AiPoweredDayPlanDto dayPlanDto : itineraryDto.getDayPlans()) {

      DayPlan dayPlan = modelMapper.map(dayPlanDto, DayPlan.class);

      dayPlan.setItinerary(itinerary);
      dayPlan.setUser(user);

      List<Activity> activities = new ArrayList<>();
      for (AiPoweredActivityDto activityDto : dayPlanDto.getActivities()) {

        Activity activity = modelMapper.map(activityDto, Activity.class);

        // A temporary UUID is assigned to enable validation checks that require a non-null ID.
        // This ID will be cleared before persistence in validateDayPlansAndActivities method.
        activity.setId(UUID.randomUUID());
        activity.setDayPlan(dayPlan);
        activity.setUser(user);
        activityUtil.setActivityType(activity, activityDto.getType());

        activities.add(activity);
      }

      dayPlan.setActivities(activities);
      dayPlans.add(dayPlan);
    }

    itinerary.setDayPlans(dayPlans);
  }
}
