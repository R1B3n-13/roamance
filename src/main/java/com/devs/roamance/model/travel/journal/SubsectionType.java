package com.devs.roamance.model.travel.journal;

public enum SubsectionType {
  SIGHTSEEING("Sightseeing"),
  ACTIVITY("Activity"),
  ROUTE("Route");

  private final String value;

  SubsectionType(String value) {
    this.value = value;
  }

  public String getValue() {
    return value;
  }

  @Override
  public String toString() {
    return value;
  }
}
