package com.devs.roamance.dto.response.ai;

import com.devs.roamance.dto.response.BaseResponseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiResponseDto extends BaseResponseDto {

  private AiDto data;

  public AiResponseDto(int status, boolean success, String message, AiDto data) {

    super(status, success, message);
    this.data = data;
  }
}
