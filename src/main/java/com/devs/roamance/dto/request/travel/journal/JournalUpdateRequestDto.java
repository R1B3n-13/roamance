package com.devs.roamance.dto.request.travel.journal;

import com.devs.roamance.dto.request.travel.LocationUpdateRequestDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JournalUpdateRequestDto {
  @Size(min = 1, max = 100, message = "Title must be between 1-100 characters")
  private String title;

  @Valid private LocationUpdateRequestDto destination;

  @Size(max = 1000, message = "Description must be less than 1000 characters")
  private String description;

  private Boolean isPublic;
  private OffsetDateTime date = OffsetDateTime.now();

  @JsonProperty("cover_image")
  @Pattern(
      regexp = "^$|(?i)^(https?:\\/\\/)[^\\s]{0,2083}$",
      message = "Cover image URL format is invalid")
  private String coverImage;
}
