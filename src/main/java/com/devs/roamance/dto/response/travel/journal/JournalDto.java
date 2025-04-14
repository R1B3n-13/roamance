package com.devs.roamance.dto.response.travel.journal;

import java.util.UUID;

import com.devs.roamance.dto.response.AuditResponseDto;
import com.devs.roamance.dto.response.LocationResponseDto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JournalDto extends AuditResponseDto {
  private UUID id;
  private String title;
  private LocationResponseDto destination;
  private String description;
}
