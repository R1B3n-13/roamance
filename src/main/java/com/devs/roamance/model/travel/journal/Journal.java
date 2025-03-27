package com.devs.roamance.model.travel.journal;

import com.devs.roamance.model.Location;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(
    name = "journals",
    uniqueConstraints = @UniqueConstraint(columnNames = {"title", "created_by"}))
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Journal {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @NonNull private String title;

  @NonNull @Embedded private Location destination;

  @Nullable private String description;

  @NonNull
  @OneToMany(mappedBy = "journal", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference
  private List<Subsection> subsections = new ArrayList<>();

  // Helper methods for managing bidirectional relationships

  public void addSubsection(Subsection subsection) {
    subsections.add(subsection);
    subsection.setJournal(this);
  }

  public void removeSubsection(Subsection subsection) {
    subsections.remove(subsection);
  }

  // Auditing Fields

  @CreatedDate
  @Setter(AccessLevel.NONE)
  private ZonedDateTime createdAt;

  @LastModifiedDate private ZonedDateTime lastModified;

  @CreatedBy
  @Setter(AccessLevel.NONE)
  @Column(name = "created_by")
  private UUID createdBy;

  @LastModifiedBy private UUID lastModifiedBy;
}
