package com.devs.roamance.controller;

import com.devs.roamance.dto.request.social.RealTimeChatRequestDto;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class RealTimeChatController {

  private final SimpMessagingTemplate simpMessagingTemplate;

  public RealTimeChatController(SimpMessagingTemplate simpMessagingTemplate) {

    this.simpMessagingTemplate = simpMessagingTemplate;
  }

  @MessageMapping("/chat/{chatId}")
  public RealTimeChatRequestDto sendToUser(
      @Valid @Payload RealTimeChatRequestDto message, @DestinationVariable String chatId) {

    simpMessagingTemplate.convertAndSendToUser(chatId, "/queue/messages", message);

    return message;
  }
}
