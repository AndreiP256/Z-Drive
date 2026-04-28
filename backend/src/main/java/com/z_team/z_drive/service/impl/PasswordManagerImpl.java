package com.z_team.z_drive.service.impl;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.z_team.z_drive.service.PasswordManager;

 // Cineva ar trebuii sa se uite peste e full chat ca sa ruleze aplicatia
@Service
public class PasswordManagerImpl implements PasswordManager {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public String hashPassword(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    public boolean matches(String rawPassword, String hashedPassword) {
        return encoder.matches(rawPassword, hashedPassword);
    }
}