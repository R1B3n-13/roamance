package com.devs.roamance.dto.response.user;

import java.time.LocalDate;
import java.time.OffsetDateTime;
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

    @JsonProperty("profile_image")
    private String profile_image;

    @JsonProperty("cover_image")
    private String cover_image;

    @JsonProperty("user_id")
    private UUID userId;

    @JsonProperty("created_at")
    private OffsetDateTime createdAt;

    @JsonProperty("last_modified_at")
    private OffsetDateTime lastModifiedAt;

}
