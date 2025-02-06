package com.devs.roamance.model.subsections;

import com.devs.roamance.model.Journal;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "subsection_type", discriminatorType = DiscriminatorType.STRING)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type", visible = true)
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
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NonNull
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "subsection_type", insertable = false, updatable = false)
    private SubsectionType type;

    @ElementCollection
    private List<String> notes = new ArrayList<>();

    @ElementCollection
    private List<String> checklists = new ArrayList<>();

    @NonNull
    @ManyToOne
    private Journal journal;

    @CreatedDate
    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @Setter(AccessLevel.NONE)
    private ZonedDateTime createdAt;

    @LastModifiedDate
    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private ZonedDateTime lastModified;

    @CreatedBy
    @Setter(AccessLevel.NONE)
    private long createdBy;

    @LastModifiedBy
    private long lastModifiedBy;
}