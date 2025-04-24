package com.devs.roamance.dto.request.travel.journal;

import com.devs.roamance.model.travel.journal.ChecklistItem;
import com.devs.roamance.model.travel.journal.SubsectionType;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type", visible = true)
@JsonSubTypes({
  @JsonSubTypes.Type(value = SightseeingSubsectionUpdateRequestDto.class, name = "SIGHTSEEING"),
  @JsonSubTypes.Type(value = ActivitySubsectionUpdateRequestDto.class, name = "ACTIVITY"),
  @JsonSubTypes.Type(value = RouteSubsectionUpdateRequestDto.class, name = "ROUTE")
})
@Getter
@Setter
public abstract class SubsectionUpdateRequestDto {

  @NotBlank(message = "Title must not be blank")
  private String title;

  @Enumerated(EnumType.STRING)
  @NotNull(message = "Type must not be null")
  private SubsectionType type;

  private List<@NotBlank(message = "Note cannot be empty") String> notes = new ArrayList<>();

  private List<@Valid ChecklistItem> checklists = new ArrayList<>();
}
