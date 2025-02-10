package com.devs.roamance.dto.request.subsection;

import com.devs.roamance.model.subsection.SubsectionType;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type", visible = true)
@JsonSubTypes({
        @JsonSubTypes.Type(value = SightseeingSubsectionCreateRequestDto.class, name = "Sightseeing"),
        @JsonSubTypes.Type(value = ActivitySubsectionCreateRequestDto.class, name = "Activity"),
        @JsonSubTypes.Type(value = RouteSubsectionCreateRequestDto.class, name = "Route")
})
@Getter
@Setter
public abstract class SubsectionCreateRequestDto {
    @NotBlank(message = "Subsection title is required")
    @Size(max = 100, message = "Title must be less than 100 characters")
    private String title;

    @NotNull(message = "Subsection type is required")
    private SubsectionType type;

    @Size(max = 10, message = "Maximum 10 notes allowed")
    private List<@NotBlank(message = "Note cannot be empty") String> notes;

    @Size(max = 10, message = "Maximum 10 checklist items allowed")
    private List<@NotBlank(message = "Checklist item cannot be empty") String> checklists;
}