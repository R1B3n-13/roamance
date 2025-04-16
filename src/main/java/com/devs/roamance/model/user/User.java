package com.devs.roamance.model.user;

import com.devs.roamance.model.social.Chat;
import com.devs.roamance.model.social.Comment;
import com.devs.roamance.model.social.Message;
import com.devs.roamance.model.social.Post;
import com.devs.roamance.model.travel.itinerary.Activity;
import com.devs.roamance.model.travel.itinerary.DayPlan;
import com.devs.roamance.model.travel.itinerary.Itinerary;
import com.devs.roamance.model.travel.journal.Journal;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.ArrayList;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @NotNull private String name;
  @NotNull private String email;
  @JsonIgnore @NotNull private String password;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
  @Enumerated(EnumType.STRING)
  private Set<Role> roles = new HashSet<>();

  @JsonIgnore
  @OneToMany(
      mappedBy = "user",
      fetch = FetchType.LAZY,
      cascade = {CascadeType.ALL},
      orphanRemoval = true)
  private List<Journal> journals = new ArrayList<>();

  @JsonIgnore
  @OneToMany(
      mappedBy = "user",
      fetch = FetchType.LAZY,
      cascade = {CascadeType.ALL},
      orphanRemoval = true)
  private List<Post> posts = new ArrayList<>();

  @JsonIgnore
  @ManyToMany(
      mappedBy = "savedBy",
      fetch = FetchType.LAZY,
      cascade = {CascadeType.DETACH, CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH})
  private Set<Post> savedPosts;

  @JsonIgnore
  @ManyToMany(
      mappedBy = "likedBy",
      fetch = FetchType.LAZY,
      cascade = {CascadeType.DETACH, CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH})
  private Set<Post> likedPosts = new HashSet<>();

  @JsonIgnore
  @OneToMany(
      mappedBy = "user",
      fetch = FetchType.LAZY,
      cascade = {CascadeType.ALL},
      orphanRemoval = true)
  private List<Comment> comments = new ArrayList<>();

  @JsonIgnore
  @ManyToMany(
      mappedBy = "users",
      fetch = FetchType.LAZY,
      cascade = {CascadeType.DETACH, CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH})
  private List<Chat> chats = new ArrayList<>();

  @JsonIgnore
  @OneToMany(
      mappedBy = "user",
      fetch = FetchType.LAZY,
      cascade = {CascadeType.ALL},
      orphanRemoval = true)
  private List<Message> messages = new ArrayList<>();

  @JsonIgnore
  @OneToMany(
      mappedBy = "user",
      fetch = FetchType.LAZY,
      cascade = {CascadeType.ALL},
      orphanRemoval = true)
  private List<Itinerary> itineraries = new ArrayList<>();

  @JsonIgnore
  @OneToMany(
      mappedBy = "user",
      fetch = FetchType.LAZY,
      cascade = {CascadeType.ALL},
      orphanRemoval = true)
  private List<DayPlan> dayPlans = new ArrayList<>();

  @JsonIgnore
  @OneToMany(
      mappedBy = "user",
      fetch = FetchType.LAZY,
      cascade = {CascadeType.ALL},
      orphanRemoval = true)
  private List<Activity> activities = new ArrayList<>();

  @CreatedDate
  @Column(updatable = false)
  private OffsetDateTime createdAt;

  @LastModifiedDate private OffsetDateTime lastModifiedAt;
}
