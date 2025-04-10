package com.devs.roamance.dto.request.social;

import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostRequestDto {

  @Size(max = 10_000, message = "Post can not contain more than 10000 characters")
  private String text;

  @Size(max = 50, message = "No more than 50 images are allowed per post")
  private List<String> imagePaths;

  @Size(max = 5, message = "No more than 5 videos are allowed per post")
  private List<String> videoPaths;
}
