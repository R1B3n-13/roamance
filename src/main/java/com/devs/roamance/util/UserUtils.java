package com.devs.roamance.util;

import com.devs.roamance.model.User;
import com.devs.roamance.repository.UserRepository;
import com.devs.roamance.security.JwtUtils;
import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class UserUtils {

  private UserRepository userRepository;
  private JwtUtils jwtUtils;

  public UserUtils(@Autowired UserRepository userRepository, @Autowired JwtUtils jwtUtils) {
    this.userRepository = userRepository;
    this.jwtUtils = jwtUtils;
  }

  public User getAuthenticatedUser(Principal connectedUser) {
    String email = jwtUtils.getAuthenticatedUserEmail(connectedUser);
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
  }

  public User getAuthenticatedUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String email = authentication.getName();
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
  }
}
