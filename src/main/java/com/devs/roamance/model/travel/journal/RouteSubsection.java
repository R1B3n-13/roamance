package com.devs.roamance.model.travel.journal;

import com.devs.roamance.model.common.Location;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity
@DiscriminatorValue("Route")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RouteSubsection extends Subsection {
  @ElementCollection @NonNull private List<Location> waypoints = new ArrayList<>();
}
