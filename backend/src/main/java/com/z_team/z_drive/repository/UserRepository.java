package com.z_team.z_drive.repository;

import com.z_team.z_drive.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository {
    Optional<User> findById(UUID id);
    Optional<User> findByEmail(String email);
    List<User> findAll();
    User save(User user);
    void delete(User user);
}