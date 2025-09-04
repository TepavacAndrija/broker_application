package com.example.BrokerService.controller;

import com.example.BrokerService.model.User;
import com.example.BrokerService.service.CreateUserDTO;
import com.example.BrokerService.service.UpdateUserDTO;
import com.example.BrokerService.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class UserController {

    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody CreateUserDTO userDTO) {
        User user = userService.createUser(userDTO);
        messagingTemplate.convertAndSend("/topic/users", user);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable UUID id, @RequestBody UpdateUserDTO userDTO) {
        User updatedUser = userService.updateUser(id,userDTO);
        messagingTemplate.convertAndSend("/topic/users", updatedUser);
        return ResponseEntity.ok(updatedUser);
    }
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable UUID id) {
        return ResponseEntity.of(userService.getUserById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable UUID id) {
        userService.deleteUser(id);
        messagingTemplate.convertAndSend("/topic/users/deleted", id.toString());
        return ResponseEntity.noContent().build();
    }

}
