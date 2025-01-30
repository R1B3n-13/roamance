package com.devs.roamance.dto;

import java.time.ZonedDateTime;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Long id;

    private String name;
    private String email;

    private Set<UserShortDto> followers;
    private Set<UserShortDto> followings;

    private ZonedDateTime createdAt;
}
