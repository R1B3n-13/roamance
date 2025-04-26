package com.devs.roamance.exception;

import java.io.Serial;

public class AiGenerationFailedException extends RuntimeException {

  @Serial private static final long serialVersionUID = 1L;

  public AiGenerationFailedException(String message) {

    super(message);
  }
}
