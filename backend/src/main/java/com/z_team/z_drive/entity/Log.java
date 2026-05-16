package com.z_team.z_drive.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "logs", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_action", columnList = "action"),
        @Index(name = "idx_timestamp", columnList = "timestamp")
})
public class Log {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "action", nullable = false)
    private String action; // upload, download, delete, share, modify_permissions, etc.

    @Column(name = "file_id")
    private UUID fileId; // Nullable if action is not file-specific

    @Column(name = "details", columnDefinition = "TEXT")
    private String details; // Additional context about the action

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "ip_address")
    private String ipAddress; // Optional: client IP for security audit

    @Column(name = "status")
    private String status; // SUCCESS, FAILED - for tracking failed operations

    /**
     * Convenience constructor for basic logging
     */
    public Log(UUID userId, String action, String details) {
        this.userId = userId;
        this.action = action;
        this.details = details;
        this.timestamp = LocalDateTime.now();
        this.status = "SUCCESS";
    }

    /**
     * Convenience constructor with file ID
     */
    public Log(UUID userId, String action, UUID fileId, String details) {
        this.userId = userId;
        this.action = action;
        this.fileId = fileId;
        this.details = details;
        this.timestamp = LocalDateTime.now();
        this.status = "SUCCESS";
    }
}
