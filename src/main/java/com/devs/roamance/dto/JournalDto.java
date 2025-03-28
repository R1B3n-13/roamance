package com.devs.roamance.dto;

import com.devs.roamance.dto.response.LocationResponseDto;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JournalDto {
  private UUID id;
  private String title;
  private LocationResponseDto destination;
  private String description;
  private OffsetDateTime lastModified;
}
