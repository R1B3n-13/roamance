package com.devs.roamance.model.travel.journal;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistItem {
  private String title;
  private boolean completed = false;

  public ChecklistItem(String title) {
    this.title = title;
    this.completed = false;
  }
}
