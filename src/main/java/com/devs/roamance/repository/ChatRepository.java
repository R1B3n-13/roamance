package com.devs.roamance.repository;

import com.devs.roamance.model.social.Chat;
import com.devs.roamance.model.user.User;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRepository extends JpaRepository<Chat, UUID> {

  Chat findByUsers(List<User> users);

  Page<Chat> findAllByUsers_Id(UUID id, Pageable pageable);
}
