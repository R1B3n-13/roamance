package com.devs.roamance.repository;

import com.devs.roamance.model.social.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {}
