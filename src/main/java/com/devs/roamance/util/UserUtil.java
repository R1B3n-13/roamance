package com.devs.roamance.util;

import com.devs.roamance.exception.AuthenticatedUserNotFoundException;
import com.devs.roamance.model.user.User;
import com.devs.roamance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class UserUtil {

  private final UserRepository userRepository;

  public UserUtil(@Autowired UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public User getAuthenticatedUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String email = authentication.getName();
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new AuthenticatedUserNotFoundException("No authenticated user found!"));
  }
}
