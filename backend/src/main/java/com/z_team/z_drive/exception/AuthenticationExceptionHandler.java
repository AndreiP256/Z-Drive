package com.z_team.z_drive.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

@Component
@RestControllerAdvice
public class AuthenticationExceptionHandler implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // 1. Handler pentru BadCredentialsException (Parolă greșită în Controller)
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        // Aici returnăm ResponseEntity pentru că suntem în context de ControllerAdvice
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(createErrorBody(HttpStatus.UNAUTHORIZED, "Email sau parolă incorectă!"));
    }

    // 2. 401 - Entry Point (Erori în Filtre)
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        writeResponse(response, HttpStatus.UNAUTHORIZED, "Eroare de autentificare: Token invalid sau inexistent.");
    }

    // 3. 403 - Access Denied (Erori de Roluri)
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        writeResponse(response, HttpStatus.FORBIDDEN, "Acces refuzat: Nu ai permisiunile necesare.");
    }

    private void writeResponse(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setContentType("application/json");
        response.setStatus(status.value());
        response.getOutputStream().println(objectMapper.writeValueAsString(createErrorBody(status, message)));
    }

    private Map<String, Object> createErrorBody(HttpStatus status, String message) {
        return Map.of(
                "timestamp", Instant.now().toString(),
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", message
        );
    }
}