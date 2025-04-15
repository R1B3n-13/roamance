package com.devs.roamance.dto.response.user;

import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferenceDto {
    private UUID id;
    private String phone;
    private String bio;
    private String location;
    private String website;
    private LocalDate birthday;

    @JsonProperty("user_id")
    private UUID userId;

}
