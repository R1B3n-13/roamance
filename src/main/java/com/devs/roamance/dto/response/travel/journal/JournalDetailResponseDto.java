package com.devs.roamance.dto.response.travel.journal;

import com.devs.roamance.dto.response.LocationResponseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JournalDetailResponseDto {
  private Long id;
  private String title;
  private LocationResponseDto destination;
  private String description;
  private List<SubsectionResponseDto> subsections;
  private ZonedDateTime createdAt;
  private ZonedDateTime lastModified;
  private long createdBy;
  private long lastModifiedBy;
}
