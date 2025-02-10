package com.devs.roamance.dto.request;

import com.devs.roamance.dto.request.subsection.SubsectionUpdateRequestDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;

public class JournalUpdateRequestDto {
    @Size(min = 1, max = 100, message = "Title must be between 1-100 characters")
    private String title;

    @Valid
    private LocationUpdateRequestDto destination;

    @Size(max = 1000, message = "Description must be less than 1000 characters")
    private String description;

    @Valid
    private List<SubsectionUpdateRequestDto> subsections;
}