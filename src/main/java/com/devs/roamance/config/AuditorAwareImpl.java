package com.devs.roamance.config;

import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.AuditorAware;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuditorAwareImpl implements AuditorAware<UUID> {
  private static final Logger logger = LoggerFactory.getLogger(AuditorAwareImpl.class);

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

    if (authentication.getDetails() != null && authentication instanceof UsernamePasswordAuthenticationToken) {
      try {
        String userIdString = authentication.getDetails().toString();
        UUID userId = UUID.fromString(userIdString);
        logger.debug("Retrieved user UUID: {} directly from authentication details", userId);
        return Optional.of(userId);
      } catch (IllegalArgumentException e) {
        logger.warn("Could not parse UUID from authentication details: {}", authentication.getDetails());
      }
    }

    logger.debug("User ID not found in authentication details");
    return Optional.empty();
  }
}
