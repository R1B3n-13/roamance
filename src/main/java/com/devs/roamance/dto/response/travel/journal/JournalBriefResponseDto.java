package com.devs.roamance.dto.response.travel.journal;

import com.devs.roamance.dto.JournalDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JournalBriefResponseDto extends JournalDto {
  private int subsectionCount;
}
