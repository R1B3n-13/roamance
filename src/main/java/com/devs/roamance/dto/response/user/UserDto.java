package com.devs.roamance.dto.response.user;

import com.devs.roamance.dto.response.AuditTimeDto;
import jakarta.persistence.Embedded;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

  private UUID id;

  private String name;
  private String email;

  @Embedded private AuditTimeDto audit = new AuditTimeDto();
}
