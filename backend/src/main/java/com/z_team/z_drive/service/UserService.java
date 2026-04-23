package com.z_team.z_drive.service;

import com.z_team.z_drive.entity.User;

import java.util.List;
import java.util.UUID;

public interface UserService {

    User createUser(User user);

    User updateUser(UUID userId, User userData);

    void deleteUser(UUID userId);

    User getUserProfile(UUID userId);

    List<User> getAllUsers();
}