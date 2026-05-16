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
public class LogFilterRequest {
    private UUID userId;           // Filter by user
    private String action;         // Filter by action type (UPLOAD, DOWNLOAD, DELETE, etc.)
    private UUID fileId;           // Filter by file
    private LocalDateTime startDate; // Filter from date (default: 30 days ago)
    private LocalDateTime endDate;   // Filter to date (default: now)
    private String status;         // Filter by status (SUCCESS, FAILED)

    /**
     * Default filter: last 30 days, all actions
     */
    public void applyDefaults() {
        if (this.endDate == null) {
            this.endDate = LocalDateTime.now();
        }
        if (this.startDate == null) {
            this.startDate = this.endDate.minusDays(30);
        }
    }
}
