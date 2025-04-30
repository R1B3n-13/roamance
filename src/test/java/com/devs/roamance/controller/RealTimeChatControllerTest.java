package com.devs.roamance.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.devs.roamance.dto.request.social.RealTimeChatRequestDto;
import com.devs.roamance.dto.response.user.UserDto;
import com.devs.roamance.model.user.User;
import com.devs.roamance.util.UserUtil;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@ExtendWith(MockitoExtension.class)
class RealTimeChatControllerTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private UserUtil userUtil;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private RealTimeChatController realTimeChatController;

    @Captor
    private ArgumentCaptor<Object> messageCaptor;

    @Test
    @DisplayName("Should send message to user")
    void sendToUserShouldSendMessage() {
        // Given
        String chatId = UUID.randomUUID().toString();
        RealTimeChatRequestDto requestDto = new RealTimeChatRequestDto();
        requestDto.setText("Test message");
        
        User authenticatedUser = new User();
        authenticatedUser.setId(UUID.randomUUID());
        authenticatedUser.setName("Test User");
        authenticatedUser.setEmail("test@example.com");

        UserDto userDto = new UserDto();
        userDto.setId(authenticatedUser.getId());
        userDto.setName(authenticatedUser.getName());
        userDto.setEmail(authenticatedUser.getEmail());
        
        when(userUtil.getAuthenticatedUser()).thenReturn(authenticatedUser);
        when(modelMapper.map(any(User.class), eq(UserDto.class))).thenReturn(userDto);
        
        // When
        RealTimeChatRequestDto result = realTimeChatController.sendToUser(requestDto, chatId);
        
        // Then
        assertNotNull(result);
        assertEquals("Test message", result.getText());
        assertEquals(userDto, result.getUser());
        
        verify(messagingTemplate).convertAndSendToUser(eq(chatId), eq("/queue/messages"), messageCaptor.capture());
        RealTimeChatRequestDto sentMessage = (RealTimeChatRequestDto) messageCaptor.getValue();
        assertEquals("Test message", sentMessage.getText());
        assertEquals(userDto, sentMessage.getUser());
    }
}
