package com.devs.roamance.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;

@Embeddable
@Getter
@Setter
public class Audit extends AuditTime {

  @CreatedBy
  @Column(name = "created_by", updatable = false)
  @Setter(AccessLevel.NONE)
  private UUID createdBy;

  @LastModifiedBy
  @Column(name = "last_modified_by")
  private UUID lastModifiedBy;
}
