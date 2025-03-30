package com.devs.roamance.model.travel.journal;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.*;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "subsection_type", discriminatorType = DiscriminatorType.STRING)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
  @JsonSubTypes.Type(value = SightseeingSubsection.class, name = "Sightseeing"),
  @JsonSubTypes.Type(value = ActivitySubsection.class, name = "Activity"),
  @JsonSubTypes.Type(value = RouteSubsection.class, name = "Route")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "subsections")
public abstract class Subsection {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @NonNull private String title;

  @ElementCollection private List<String> notes = new ArrayList<>();

  @ElementCollection private List<String> checklists = new ArrayList<>();

  @JsonBackReference @ManyToOne private Journal journal;

  // Methods
  @Transient
  public String getType() {
    return this.getClass().getAnnotation(DiscriminatorValue.class).value();
  }

  // Add a method to expose the journal ID in JSON responses
  @Transient
  @JsonProperty("journalId")
  public UUID getJournalId() {
    return journal != null ? journal.getId() : null;
  }
}
