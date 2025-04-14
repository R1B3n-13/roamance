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
public class MessageDto extends AuditDto {

  private UUID id;
  private String text;

  @JsonProperty("image_paths")
  private List<String> imagePaths=new ArrayList<>();

  @JsonProperty("video_paths")
  private List<String> videoPaths=new ArrayList<>();

  private UserDto user;

}
