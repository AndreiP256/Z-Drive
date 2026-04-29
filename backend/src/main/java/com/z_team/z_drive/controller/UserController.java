package com.z_team.z_drive.controller;

import com.z_team.z_drive.dto.user.CreateUserRequest;
import com.z_team.z_drive.dto.user.UpdateUserRequest;
import com.z_team.z_drive.dto.user.UserResponse;
import com.z_team.z_drive.entity.User;
import com.z_team.z_drive.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers()
                .stream()
                .map(this::mapToResponse)
                .toList();

        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        User user = userService.getUserProfile(id);
        return ResponseEntity.ok(mapToResponse(user));
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<UserResponse> getUserProfile(@PathVariable UUID id) {
        User user = userService.getUserProfile(id);
        return ResponseEntity.ok(mapToResponse(user));
    }

    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(@RequestBody CreateUserRequest request) {
        User userToCreate = mapCreateRequestToUser(request);
        User createdUser = userService.createUser(userToCreate);

        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(createdUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable UUID id,
                                                   @RequestBody UpdateUserRequest request) {
        User userToUpdate = mapUpdateRequestToUser(request);
        User updatedUser = userService.updateUser(id, userToUpdate);

        return ResponseEntity.ok(mapToResponse(updatedUser));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    private User mapCreateRequestToUser(CreateUserRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());
        return user;
    }

    private User mapUpdateRequestToUser(UpdateUserRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());
        return user;
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}