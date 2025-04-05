package com.devs.roamance.dto.response.travel.journal;

import com.devs.roamance.model.travel.journal.SubsectionType;
import com.fasterxml.jackson.annotation.JsonInclude;
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
public class SubsectionDto {
  private UUID id;
  private String title;
  private SubsectionType type;
  private UUID journalId;
}
