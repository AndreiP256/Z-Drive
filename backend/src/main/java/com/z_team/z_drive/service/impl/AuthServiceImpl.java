package com.z_team.z_drive.service.impl;

import java.util.List;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import com.z_team.z_drive.dto.auth.LoginResponse;
import com.z_team.z_drive.entity.User;
import com.z_team.z_drive.repository.UserRepository;
import com.z_team.z_drive.security.JwtService;
import com.z_team.z_drive.service.AuthService;
import com.z_team.z_drive.service.PasswordManager;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordManager passwordManager;
    private final JwtService jwtService;

    @Override
    public LoginResponse login(String email, String password) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Email sau parolă incorectă"));

        if (!passwordManager.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Email sau parolă incorectă");
        }
        
        String token = jwtService.generateToken(
            user.getId(),
            user.getEmail(), 
            List.of(user.getRole().name())
        );

        return new LoginResponse(token);
    }
}