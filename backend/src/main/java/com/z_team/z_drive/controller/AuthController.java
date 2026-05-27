package com.z_team.z_drive.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.z_team.z_drive.dto.auth.LoginRequest;
import com.z_team.z_drive.dto.auth.LoginResponse;
import com.z_team.z_drive.service.AuthService;


@RestController
@RequestMapping("/auth")
public class AuthController {
    
    private final AuthService authService;

    AuthController(AuthService authService) {
        this.authService= authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(response);
    }
}
