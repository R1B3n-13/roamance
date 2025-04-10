package com.devs.roamance.dto.response.travel.journal;

import com.devs.roamance.model.travel.journal.SubsectionType;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SubsectionDetailDto {
  private UUID id;
  private String title;
  private SubsectionType type;
  private List<String> notes = new ArrayList<>();
  private List<String> checklists = new ArrayList<>();

  @JsonProperty("journal_id")
  private UUID journalId;
}
