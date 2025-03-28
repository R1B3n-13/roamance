package com.devs.roamance.exception;

import java.io.Serial;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public class JournalNotFoundException extends RuntimeException {

  @Serial private static final long serialVersionUID = 1L;

  public JournalNotFoundException(String message) {
    super(message);
  }
}
