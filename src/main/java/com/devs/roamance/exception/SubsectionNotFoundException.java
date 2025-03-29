package com.devs.roamance.exception;

import java.io.Serial;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public class SubsectionNotFoundException extends RuntimeException {

  @Serial private static final long serialVersionUID = 1L;

  public SubsectionNotFoundException(String message) {
    super(message);
  }
}
