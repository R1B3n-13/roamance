package com.devs.roamance.model.travel.journal;

import com.devs.roamance.model.Location;
import com.devs.roamance.model.User;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.annotation.Nullable;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Table(
    name = "journals",
    uniqueConstraints = @UniqueConstraint(columnNames = {"title", "created_by"}))
public class Journal {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @NonNull private String title;

  @NonNull @Embedded private Location destination;

  @Nullable private String description;

  @OneToMany(
      mappedBy = "journal",
      fetch = FetchType.LAZY,
      cascade = CascadeType.ALL,
      orphanRemoval = true)
  private List<Subsection> subsections = new ArrayList<>();

  @JsonIgnore
  @ManyToOne(
      fetch = FetchType.LAZY,
      cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.DETACH, CascadeType.REFRESH})
  @JoinColumn(name = "user_id", referencedColumnName = "id")
  private User user;

  // Helper methods for managing bidirectional relationships

  public void addSubsection(Subsection subsection) {
    subsections.add(subsection);
    subsection.setJournal(this);
  }

  public void removeSubsection(Subsection subsection) {
    subsections.remove(subsection);
  }

  @Override
  public String toString() {
    return "Journal{"
        + "id="
        + id
        + ", title='"
        + title
        + '\''
        + ", destination="
        + destination
        + ", description='"
        + description
        + '\''
        + ", subsectionsCount="
        + subsections.size()
        + ", createdAt="
        + createdAt
        + ", lastModified="
        + lastModified
        + '}';
  }

  // Auditing Fields

  @CreatedDate
  @Setter(AccessLevel.NONE)
  private OffsetDateTime createdAt;

  @LastModifiedDate private OffsetDateTime lastModified;

  @CreatedBy
  @Setter(AccessLevel.NONE)
  @Column(name = "created_by")
  private UUID createdBy;

  @LastModifiedBy private UUID lastModifiedBy;
}
