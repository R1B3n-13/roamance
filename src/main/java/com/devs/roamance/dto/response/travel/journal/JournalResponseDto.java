package com.devs.roamance.dto.response.travel.journal;

import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.model.travel.journal.Journal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JournalResponseDto extends BaseResponseDto {
  private Journal data;

  public JournalResponseDto(int status, boolean success, String message, Journal data) {
    super(status, success, message);
    this.data = data;
  }
}
