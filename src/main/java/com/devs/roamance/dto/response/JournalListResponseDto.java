package com.devs.roamance.dto.response;

import com.devs.roamance.model.travel.journal.Journal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JournalListResponseDto extends BaseResponseDto {
  private List<Journal> data;

  public JournalListResponseDto(int status, boolean success, String message, List<Journal> data) {
    super(status, success, message);
    this.data = data;
  }
}
