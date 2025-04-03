package com.devs.roamance.exception;

import java.io.Serial;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public class JournalAlreadyExistException extends RuntimeException {

  @Serial private static final long serialVersionUID = 1L;

  public JournalAlreadyExistException(String message) {
    super(message);
  }
}
