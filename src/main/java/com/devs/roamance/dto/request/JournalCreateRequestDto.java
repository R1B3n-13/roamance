package com.devs.roamance.dto.request;

import com.devs.roamance.dto.request.subsection.SubsectionCreateRequestDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JournalCreateRequestDto {
    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must be less than 100 characters")
    private String title;
    @Valid
    @NotNull(message = "Destination is required")
    private LocationCreateRequestDto destination;
    @Size(max = 1000, message = "Description must be less than 1000 characters")
    private String description;

    @Valid
    @Size(max = 20, message = "Maximum 20 subsections allowed")
    private List<SubsectionCreateRequestDto> subsections = new ArrayList<>();
}
