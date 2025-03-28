package com.devs.roamance.exception.handler;

import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.exception.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Slf4j
@ControllerAdvice
@Order(2)
public class GlobalExceptionHandler {

  @ExceptionHandler(UserNotFoundException.class)
  public ResponseEntity<BaseResponseDto> handleUserNotFoundException(UserNotFoundException ex) {

    log.error("UserNotFoundException: {}", ex.getMessage(), ex);

    return new ResponseEntity<>(
        new BaseResponseDto(404, false, ex.getMessage()), HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(UserAlreadyExistException.class)
  public ResponseEntity<BaseResponseDto> handleUserAlreadyExistException(
      UserAlreadyExistException ex) {

    log.error("UserAlreadyExistException: {}", ex.getMessage(), ex);

    return new ResponseEntity<>(
        new BaseResponseDto(409, false, ex.getMessage()), HttpStatus.CONFLICT);
  }

  @ExceptionHandler(AuthenticationFailedException.class)
  public ResponseEntity<BaseResponseDto> handleAuthenticationFailedException(
      AuthenticationFailedException ex) {

    log.error("AuthenticationFailedException: {}", ex.getMessage(), ex);

    return new ResponseEntity<>(
        new BaseResponseDto(401, false, ex.getMessage()), HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(AuthTokenNotFoundException.class)
  public ResponseEntity<BaseResponseDto> handleAuthTokenNotFoundException(
      AuthTokenNotFoundException ex) {

    log.error("AuthTokenNotFoundException: {}", ex.getMessage(), ex);

    return new ResponseEntity<>(
        new BaseResponseDto(401, false, ex.getMessage()), HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(WrongCredentialsException.class)
  public ResponseEntity<BaseResponseDto> handleWrongCredentialsException(
      WrongCredentialsException ex) {

    log.error("WrongCredentialsException: {}", ex.getMessage(), ex);

    return new ResponseEntity<>(
        new BaseResponseDto(401, false, ex.getMessage()), HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<BaseResponseDto> handleIllegalArgumentException(
      IllegalArgumentException ex) {

    log.error("IllegalArgumentException: {}", ex.getMessage(), ex);

    return new ResponseEntity<>(
        new BaseResponseDto(400, false, ex.getMessage()), HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<BaseResponseDto> handleGeneralException(Exception ex) {

    log.error("GeneralException: {}", ex.getMessage(), ex);

    return new ResponseEntity<>(
        new BaseResponseDto(500, false, "Internal server error"), HttpStatus.INTERNAL_SERVER_ERROR);
  }

  // Journal

  @ExceptionHandler(JournalNotFoundException.class)
  public ResponseEntity<BaseResponseDto> handleJournalNotFoundException(
      JournalNotFoundException ex) {

    log.error("JournalNotFoundException: {}", ex.getMessage(), ex);

    return new ResponseEntity<>(
        new BaseResponseDto(404, false, ex.getMessage()), HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(JournalAlreadyExistException.class)
  public ResponseEntity<BaseResponseDto> handleJournalAlreadyExistException(
      JournalAlreadyExistException ex) {

    log.error("JournalAlreadyExistException: {}", ex.getMessage(), ex);

    return new ResponseEntity<>(
        new BaseResponseDto(409, false, ex.getMessage()), HttpStatus.CONFLICT);
  }

  @ExceptionHandler(SubsectionTypeDeserializationException.class)
  public ResponseEntity<BaseResponseDto> handleSubsectionTypeDeserializationException(
      SubsectionTypeDeserializationException ex) {

    log.error("SubsectionTypeDeserializationException: {}", ex.getMessage(), ex);

    return new ResponseEntity<>(
        new BaseResponseDto(400, false, ex.getMessage()), HttpStatus.BAD_REQUEST);
  }
}
