package com.devs.roamance.dto.response.social;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.devs.roamance.dto.response.AuditDto;
import com.devs.roamance.dto.response.user.UserDto;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatDto extends AuditDto {

  private UUID id;
  private List<UserDto> users = new ArrayList<>();

  @JsonProperty("last_text")
  private String lastText;

}
