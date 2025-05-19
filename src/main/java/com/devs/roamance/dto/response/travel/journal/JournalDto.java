package com.devs.roamance.dto.response.travel.journal;

import com.devs.roamance.dto.response.AuditDto;
import com.devs.roamance.dto.response.travel.LocationResponseDto;
import com.devs.roamance.dto.response.user.UserDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
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

  @JsonProperty("is_favorite")
  private Boolean isFavorite;

  @JsonProperty("is_archived")
  private Boolean isArchived;

  @JsonProperty("is_shared")
  private Boolean isShared;

  private LocalDate date;

  @JsonProperty("cover_image")
  private String coverImage;

  private UserDto user;

  private AuditDto audit = new AuditDto();
}
