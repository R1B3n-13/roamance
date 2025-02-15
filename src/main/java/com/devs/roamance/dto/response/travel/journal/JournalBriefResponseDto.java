package com.devs.roamance.dto.response.travel.journal;

import com.devs.roamance.dto.response.LocationResponseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JournalBriefResponseDto {
    private Long id;
    private String title;
    private LocationResponseDto destination;
    private String description;
    private int subsectionCount;
    private ZonedDateTime lastModified;
}
