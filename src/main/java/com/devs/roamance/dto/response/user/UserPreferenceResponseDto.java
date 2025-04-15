package com.devs.roamance.dto.response.user;

import com.devs.roamance.dto.response.BaseResponseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferenceResponseDto extends BaseResponseDto {

    private UserPreferenceDto data;

    public UserPreferenceResponseDto(int status, boolean success, String message, UserPreferenceDto data) {
        super(status, success, message);
        this.data = data;
    }
}
