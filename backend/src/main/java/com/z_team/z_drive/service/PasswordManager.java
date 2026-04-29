package com.z_team.z_drive.service;

public interface PasswordManager {
    String hashPassword(String rawPassword);

    boolean matches(String password, String password2);
}