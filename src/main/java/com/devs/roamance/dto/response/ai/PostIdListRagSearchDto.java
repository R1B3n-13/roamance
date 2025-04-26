package com.devs.roamance.dto.response.ai;

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
public class PostIdListRagSearchDto {

  private List<UUID> postIds = new ArrayList<>();
}
