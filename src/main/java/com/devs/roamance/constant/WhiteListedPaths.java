package com.devs.roamance.constant;

import java.util.List;

public final class WhiteListedPaths {

  private WhiteListedPaths() {}

  public static final List<String> WHITELIST_PATHS =
      List.of("/auth/**", "/swagger-ui.html", "/swagger-ui/**", "/api-docs/**", "/api-docs");
}
