package com.devs.roamance.constant;

public final class ResponseMessage {

  private ResponseMessage() {}

  // Registration and login related messages

  public static final String REGISTRATION_SUCCESS = "Registration successful.";
  public static final String LOGIN_SUCCESS = "Login successful.";
  public static final String TOKEN_REFRESH_SUCCESS = "Token refreshed successfully.";

  // User related messages

  public static final String USER_FETCH_SUCCESS = "User fetched successfully.";
  public static final String USERS_FETCH_SUCCESS = "Users fetched successfully.";
  public static final String USER_UPDATE_SUCCESS = "User updated successfully.";
  public static final String USER_DELETE_SUCCESS = "User deleted successfully.";
  public static final String USER_NOT_FOUND_ID = "No user present with id: %s!";
  public static final String USER_NOT_FOUND_EMAIL = "No user present with email: %s!";
  public static final String USER_ALREADY_EXIST = "User already exists with email: %s!";

  // Authentication related messages

  public static final String AUTHENTICATION_FAILED = "Authentication failed!";
  public static final String AUTH_TOKEN_MISSING = "Authentication token is missing!";
  public static final String WRONG_CREDENTIALS = "Wrong credentials!";
  public static final String JWT_CLAIMS_EMPTY = "JWT claims string is empty!";
  public static final String INVALID_TOKEN_TYPE = "Invalid token type!";

  // Journal related messages
  public static final String JOURNAL_CREATE_SUCCESS = "Journal created successfully.";
  public static final String JOURNAL_FETCH_SUCCESS = "Journal fetched successfully.";
  public static final String JOURNALS_FETCH_SUCCESS = "Journals fetched successfully.";
  public static final String JOURNAL_UPDATE_SUCCESS = "Journal updated successfully.";
  public static final String JOURNAL_DELETE_SUCCESS = "Journal deleted successfully.";
  public static final String JOURNAL_NOT_FOUND = "No journal present with id: %s!";
  public static final String JOURNAL_ACCESS_DENIED =
      "You don't have permission to access this journal!";
  public static final String JOURNAL_ALREADY_EXIST = "Journal already exists with title: %s!";
  // Subsection related messages
  public static final String SUBSECTION_CREATE_SUCCESS = "Subsection created successfully.";
  public static final String SUBSECTION_FETCH_SUCCESS = "Subsection fetched successfully.";
  public static final String SUBSECTIONS_FETCH_SUCCESS = "Subsections fetched successfully.";
  public static final String SUBSECTION_UPDATE_SUCCESS = "Subsection updated successfully.";
  public static final String SUBSECTION_DELETE_SUCCESS = "Subsection deleted successfully.";
  public static final String SUBSECTION_ADD_SUCCESS = "Subsection added to journal successfully.";
  public static final String SUBSECTION_REMOVE_SUCCESS =
      "Subsection removed from journal successfully.";
  public static final String SUBSECTION_NOT_FOUND = "No subsection present with id: %s!";

  public static final String VALIDATION_FAILED = "Validation failed!";
}
