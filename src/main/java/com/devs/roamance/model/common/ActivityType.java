package com.devs.roamance.model.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ActivityType {
  SIGHTSEEING("Sightseeing"),
  NATURE_AND_OUTDOORS("Nature and Outdoors"),
  CULTURAL_EXPERIENCE("Cultural Experience"),
  FOOD_AND_DINING("Food & Dining"),
  ENTERTAINMENT("Entertainment"),
  OTHER("Other");

  private final String name;

  public static ActivityType fromString(String input) {

    if (input == null) {
      return OTHER;
    }

    String trimmedInput = input.trim();

    for (ActivityType type : ActivityType.values()) {

      if (type.name().equalsIgnoreCase(trimmedInput)
          || type.getName().equalsIgnoreCase(trimmedInput)) {

        return type;
      }
    }

    return OTHER;
  }
}
