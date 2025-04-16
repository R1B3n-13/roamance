package com.devs.roamance.repository;

import com.devs.roamance.model.travel.itinerary.Activity;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {

  Page<Activity> findAllByDayPlanId(UUID dayPlanId, Pageable pageable);
}
