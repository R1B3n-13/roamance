package com.devs.roamance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JournalResponseDto {
    private Long id;
    private String title;
    private LocationResponseDto destination;
    private String description;
    private ZonedDateTime createdAt;
    private ZonedDateTime lastModified;
    private long createdBy;
    private long lastModifiedBy;
}
