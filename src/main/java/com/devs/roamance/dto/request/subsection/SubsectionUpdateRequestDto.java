package com.devs.roamance.dto.request.subsection;

import com.devs.roamance.model.subsection.SubsectionType;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type", visible = true)
@JsonSubTypes({
        @JsonSubTypes.Type(value = SightseeingSubsectionUpdateRequestDto.class, name = "Sightseeing"),
        @JsonSubTypes.Type(value = ActivitySubsectionUpdateRequestDto.class, name = "Activity"),
        @JsonSubTypes.Type(value = RouteSubsectionUpdateRequestDto.class, name = "Route")
})
@Getter
@Setter
public abstract class SubsectionUpdateRequestDto {
    private Long id;

    @Size(min = 1, max = 100, message = "Title must be between 1-100 characters")
    private String title;

    private SubsectionType type;

    @Size(max = 10, message = "Maximum 10 notes allowed")
    private List<@NotBlank(message = "Note cannot be empty") String> notes;

    @Size(max = 10, message = "Maximum 10 checklist items allowed")
    private List<@NotBlank(message = "Checklist item cannot be empty") String> checklists;
}