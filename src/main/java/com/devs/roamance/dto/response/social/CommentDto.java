package com.devs.roamance.dto.response.social;

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
public class CommentDto extends AuditDto {

  private UUID id;
  private String text;

  @JsonProperty("image_path")
  private String imagePath;

  @JsonProperty("video_path")
  private String videoPath;

  private UserDto user;

}
