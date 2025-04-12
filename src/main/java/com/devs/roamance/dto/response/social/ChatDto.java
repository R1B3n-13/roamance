package com.devs.roamance.dto.response.social;

import com.devs.roamance.dto.response.user.UserDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatDto {

  private UUID id;
  private List<UserDto> users = new ArrayList<>();

  @JsonProperty("last_text")
  private String lastText;

  @JsonProperty("created_at")
  private OffsetDateTime createdAt;

  @JsonProperty("last_modified_at")
  private OffsetDateTime lastModifiedAt;

  @JsonProperty("created_by")
  private UUID createdBy;

  @JsonProperty("last_modified_by")
  private UUID lastModifiedBy;
}
