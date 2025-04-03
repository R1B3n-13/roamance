package com.devs.roamance.config;

import com.devs.roamance.repository.UserRepository;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.AuditorAware;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuditorAwareImpl implements AuditorAware<UUID> {
  private static final Logger logger = LoggerFactory.getLogger(AuditorAwareImpl.class);

  private final UserRepository userRepository;

  public AuditorAwareImpl(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Override
  @NonNull
  public Optional<UUID> getCurrentAuditor() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null
        || !authentication.isAuthenticated()
        || authentication.getPrincipal().equals("anonymousUser")) {
      logger.debug("No authenticated user found, cannot provide UUID auditor");
      return Optional.empty();
    }

    String email = authentication.getName();
    logger.debug("Getting auditor UUID for user with email: {}", email);

    return userRepository
        .findByEmail(email)
        .map(
            user -> {
              UUID userId = user.getId();
              logger.debug("Found user UUID: {} for email: {}", userId, email);
              return userId;
            });
  }
}
