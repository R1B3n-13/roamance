package com.devs.roamance.dto.response.ai;

import com.devs.roamance.dto.common.AiPoweredItineraryDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiPoweredItineraryResponseDto extends BaseResponseDto {

  private AiPoweredItineraryDto data;

  public AiPoweredItineraryResponseDto(
      int status, boolean success, String message, AiPoweredItineraryDto data) {

    super(status, success, message);
    this.data = data;
  }
}
