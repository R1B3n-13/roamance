package com.devs.roamance.dto.response.travel.journal;

import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.model.travel.journal.Subsection;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubsectionListResponseDto extends BaseResponseDto {
  private List<Subsection> data;

  public SubsectionListResponseDto(
      Integer status, Boolean success, String message, List<Subsection> data) {
    super(status, success, message);
    this.data = data;
  }
}
