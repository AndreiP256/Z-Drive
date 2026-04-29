package com.z_team.z_drive.service;

import com.z_team.z_drive.dto.auth.LoginResponse;

public interface AuthService {
    LoginResponse login(String email, String password);
}
