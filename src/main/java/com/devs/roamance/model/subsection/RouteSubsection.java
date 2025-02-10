package com.devs.roamance.model.subsection;

import com.devs.roamance.model.Location;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@DiscriminatorValue("Route")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RouteSubsection extends Subsection {
    @ElementCollection
    @NonNull
    private List<Location> locations = new ArrayList<>();

    @NonNull
    private Integer totalTime;

    @NonNull
    private Double totalDistance;
}
