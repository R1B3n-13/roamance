package com.devs.roamance.dto.request.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequestDto {

  @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
  private String name;

  @Email(message = "Email must be valid")
  private String email;

  @Size(min = 8, max = 20, message = "Password must be between 8 and 20 characters")
  @Pattern(
      regexp = "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$",
      message =
          "Password must contain at least one digit, one lowercase letter, "
              + "one uppercase letter, one special character, and no whitespace")
  private String password;

  @JsonProperty("profile_image")
  @Pattern(
      regexp = "^$|(?i)^(https?:\\/\\/)[^\\s]{0,2083}$",
      message = "Profile image URL format is invalid")
  private String profileImage;
}
