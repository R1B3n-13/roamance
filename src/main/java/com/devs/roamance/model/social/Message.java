package com.devs.roamance.model.social;

import com.devs.roamance.model.user.User;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "messages")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Message {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(length = 4000)
  private String text;

  @Size(max = 20, message = "No more than 20 images are allowed per message")
  @ElementCollection(fetch = FetchType.LAZY)
  private List<String> imagePaths = new ArrayList<>();

  @Size(max = 3, message = "No more than 3 videos are allowed per message")
  @ElementCollection(fetch = FetchType.LAZY)
  private List<String> videoPaths = new ArrayList<>();

  @JsonIgnore
  @ManyToOne(
      fetch = FetchType.LAZY,
      cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.DETACH, CascadeType.REFRESH})
  @JoinColumn(name = "user_id", referencedColumnName = "id")
  private User user;

  @JsonIgnore
  @ManyToOne(
      fetch = FetchType.LAZY,
      cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.DETACH, CascadeType.REFRESH})
  @JoinColumn(name = "chat_id", referencedColumnName = "id")
  private Chat chat;

  @CreatedDate
  @Column(updatable = false)
  private OffsetDateTime createdAt;

  @LastModifiedDate private OffsetDateTime lastModifiedAt;

  @CreatedBy
  @Column(updatable = false)
  private UUID createdBy;

  @LastModifiedBy private UUID lastModifiedBy;
}
