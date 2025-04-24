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
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type", visible = true)
@JsonSubTypes({
  @JsonSubTypes.Type(value = SightseeingSubsectionCreateRequestDto.class, name = "SIGHTSEEING"),
  @JsonSubTypes.Type(value = ActivitySubsectionCreateRequestDto.class, name = "ACTIVITY"),
  @JsonSubTypes.Type(value = RouteSubsectionCreateRequestDto.class, name = "ROUTE")
})
@Getter
@Setter
public abstract class SubsectionCreateRequestDto {

  @NotBlank(message = "Title must not be blank")
  private String title;

  @Enumerated(EnumType.STRING)
  @NotNull(message = "Type must not be null")
  private SubsectionType type;

  @NotNull(message = "Journal ID must not be null")
  private UUID journalId;

  @Size(max = 10, message = "Maximum 10 notes allowed")
  private List<@NotBlank(message = "Note cannot be empty") String> notes = new ArrayList<>();

  @Size(max = 50, message = "Maximum 10 checklist items allowed")
  private List<@Valid ChecklistItem> checklists = new ArrayList<>();
}
