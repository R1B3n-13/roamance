package com.devs.roamance.util;

import com.devs.roamance.model.common.ActivityType;
import com.devs.roamance.model.travel.itinerary.Activity;
import org.springframework.stereotype.Component;

@Component
public class ActivityUtil {

  public void setActivityType(Activity activity, String inputType) {

    // Manually set ActivityType
    ActivityType activityType = ActivityType.fromString(inputType);
    activity.setType(activityType);

    // Set otherTypeName only for custom OTHER types
    String otherTypeName =
        (activityType == ActivityType.OTHER && inputType != null) ? inputType : null;

    activity.setOtherTypeName(otherTypeName);
  }
}
