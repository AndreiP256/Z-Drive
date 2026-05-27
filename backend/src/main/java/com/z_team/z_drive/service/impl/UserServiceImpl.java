package com.z_team.z_drive.service.impl;

import com.z_team.z_drive.entity.User;
import com.z_team.z_drive.repository.UserRepository;
import com.z_team.z_drive.service.LogService;
import com.z_team.z_drive.service.PasswordManager;
import com.z_team.z_drive.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordManager passwordManager;
    private final LogService logService;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordManager passwordManager,
                           LogService logService) {
        this.userRepository = userRepository;
        this.passwordManager = passwordManager;
        this.logService = logService;
    }

    @Override
    @Transactional
    public User createUser(User user) {
        validateUserForCreate(user);

        String normalizedEmail = normalizeEmail(user.getEmail());

        // Prevent duplicate accounts with the same email
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("A user with this email already exists: " + normalizedEmail);
        }


        user.setName(user.getName().trim());
        user.setEmail(normalizedEmail);

        // Store only the hashed password
        user.setPassword(passwordManager.hashPassword(user.getPassword()));

        User savedUser = userRepository.save(user);

        // Audit log for user creation
        logService.logAction(
                savedUser.getId(),
                "CREATE_USER",
                "Created account for email: " + savedUser.getEmail()
        );

        return savedUser;
    }

    @Override
    @Transactional
    public User updateUser(UUID userId, User userData) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null.");
        }

        if (userData == null) {
            throw new IllegalArgumentException("User data cannot be null.");
        }

        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + userId));

        validateUserForUpdate(userData);

        String normalizedEmail = normalizeEmail(userData.getEmail());

        // Check if another user already uses the same email
        Optional<User> userWithSameEmail = userRepository.findByEmail(normalizedEmail);
        if (userWithSameEmail.isPresent() && !userWithSameEmail.get().getId().equals(userId)) {
            throw new IllegalArgumentException("Email is already used by another user.");
        }

        existingUser.setName(userData.getName().trim());
        existingUser.setEmail(normalizedEmail);
        existingUser.setRole(userData.getRole());

        // Only update the password if a new one was provided
        if (!isBlank(userData.getPassword())) {
            existingUser.setPassword(passwordManager.hashPassword(userData.getPassword()));
        }

        User updatedUser = userRepository.save(existingUser);

        // Audit log for user update
        logService.logAction(
                updatedUser.getId(),
                "UPDATE_USER",
                "Updated account for email: " + updatedUser.getEmail()
        );

        return updatedUser;
    }

    @Override
    @Transactional
    public void deleteUser(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null.");
        }

        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + userId));

        userRepository.delete(existingUser);

        // Audit log for user deletion
        logService.logAction(
                userId,
                "DELETE_USER",
                "Deleted account with email: " + existingUser.getEmail()
        );
    }

    @Override
    public User getUserProfile(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null.");
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + userId));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(User::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private void validateUserForCreate(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null.");
        }

        validateCommonFields(user);
    }

    private void validateUserForUpdate(User user) {
        if (user == null) {
            throw new IllegalArgumentException("Update data cannot be null.");
        }

        if (isBlank(user.getPassword())) {
            return;
        }

        validateCommonFieldsExceptPassword(user);
    }

    private void validateCommonFields(User user) {
        validateCommonFieldsExceptPassword(user);

        if (isBlank(user.getPassword())) {
            throw new IllegalArgumentException("Password cannot be empty.");
        }
    }

    private void validateCommonFieldsExceptPassword(User user) {
        if (isBlank(user.getName())) {
            throw new IllegalArgumentException("Name cannot be empty.");
        }

        if (isBlank(user.getEmail())) {
            throw new IllegalArgumentException("Email cannot be empty.");
        }

        if (user.getRole() == null) {
            throw new IllegalArgumentException("Role cannot be null.");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    @Override
    @Transactional
    public void changePassword(UUID currentUserId, String newPassword) {
        if (currentUserId == null) {
            throw new IllegalArgumentException("Current user ID cannot be null.");
        }

        if (isBlank(newPassword)) {
            throw new IllegalArgumentException("New password cannot be empty.");
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + currentUserId));
        user.setPassword(passwordManager.hashPassword(newPassword));
        userRepository.save(user);
    }
}