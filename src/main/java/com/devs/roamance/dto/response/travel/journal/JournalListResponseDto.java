package com.devs.roamance.dto.response.travel.journal;

import com.devs.roamance.dto.JournalDto;
import com.devs.roamance.dto.response.BaseResponseDto;
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
  private List<JournalDto> data;

  public JournalListResponseDto(
      int status, boolean success, String message, List<JournalDto> data) {
    super(status, success, message);
    this.data = data;
  }
}
