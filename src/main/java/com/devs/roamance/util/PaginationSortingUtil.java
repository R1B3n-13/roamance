package com.devs.roamance.util;

import org.springframework.data.domain.Sort;

public class PaginationSortingUtil {

  private PaginationSortingUtil() {}

  public static int validatePageSize(int size) {

    final int MAX_PAGE_SIZE = 50;
    return Math.min(size, MAX_PAGE_SIZE);
  }

  public static Sort.Direction getSortDirection(String sortDir) {

    return sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
  }
}
