package com.devs.roamance.util;

import org.springframework.data.domain.Sort;

public class PaginationSortingUtil {

  private PaginationSortingUtil() {}

  public static int validatePageNumber(int pageNumber) {

    final int MAX_PAGE_NUMBER = 10_000;
    return Math.clamp(pageNumber, 0, MAX_PAGE_NUMBER);
  }

  public static int validatePageSize(int pageSize) {

    final int MAX_PAGE_SIZE = 50;
    return Math.clamp(pageSize, 1, MAX_PAGE_SIZE);
  }

  public static Sort.Direction getSortDirection(String sortDir) {

    return sortDir != null && sortDir.equalsIgnoreCase("desc")
        ? Sort.Direction.DESC
        : Sort.Direction.ASC;
  }
}
