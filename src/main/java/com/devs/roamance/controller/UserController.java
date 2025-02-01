package com.devs.roamance.controller;

import com.devs.roamance.dto.request.UserCreateRequestDto;
import com.devs.roamance.dto.request.UserUpdateRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.UserListResponseDto;
import com.devs.roamance.dto.response.UserResponseDto;
import com.devs.roamance.service.UserService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {

        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<BaseResponseDto> createUser(@RequestBody UserCreateRequestDto requestDto) {

        BaseResponseDto responseDto = userService.create(requestDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    @GetMapping
    public ResponseEntity<UserListResponseDto> getAllUsers() {

        UserListResponseDto responseDto = userService.getAll();

        return ResponseEntity.ok(responseDto);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable @NotNull Long userId) {

        UserResponseDto responseDto = userService.getById(userId);

        return ResponseEntity.ok(responseDto);
    }

    @GetMapping("/by-email")
    public ResponseEntity<UserResponseDto> getUserByEmail(@RequestParam @Email @NotBlank String email) {

        UserResponseDto responseDto = userService.getByEmail(email);

        return ResponseEntity.ok(responseDto);
    }

    @GetMapping("/search")
    public ResponseEntity<UserListResponseDto> searchUsers(@RequestParam @NotBlank
                                                           @Pattern(regexp = "^[a-zA-Z0-9\\s]{1,50}$")
                                                           String query) {

        UserListResponseDto responseDto = userService.search(query);

        return ResponseEntity.ok(responseDto);
    }

    @PutMapping("/update/{userId}")
    public ResponseEntity<BaseResponseDto> updateUser(@RequestBody UserUpdateRequestDto requestDto,
                                                      @PathVariable @NotNull Long userId) {

        BaseResponseDto responseDto = userService.update(requestDto, userId);

        return ResponseEntity.ok(responseDto);
    }

    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<BaseResponseDto> deleteUser(@PathVariable @NotNull Long userId) {


        BaseResponseDto responseDto = userService.delete(userId);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(responseDto);
    }
}