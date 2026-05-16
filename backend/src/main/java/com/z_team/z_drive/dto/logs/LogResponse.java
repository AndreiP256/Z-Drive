package com.z_team.z_drive.dto.logs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LogResponse {
    private UUID id;
    private UUID userId;
    private String userName; // For display purposes
    private String action;
    private UUID fileId;
    private String fileName; // For display purposes
    private String details;
    private LocalDateTime timestamp;
    private String ipAddress;
    private String status;
}
