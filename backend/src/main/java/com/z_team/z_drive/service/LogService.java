package com.z_team.z_drive.service;

import com.z_team.z_drive.dto.logs.LogFilterRequest;
import com.z_team.z_drive.dto.logs.LogResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.UUID;

public interface LogService {

    /**
     * Log an action without file reference
     */
    void logAction(UUID userId, String action, String details);

    /**
     * Log an action with file reference
     */
    void logAction(UUID userId, String action, UUID fileId, String details);

    /**
     * Log an action with custom status
     */
    void logAction(UUID userId, String action, UUID fileId, String details, String status);

    /**
     * Get all logs with pagination
     */
    Page<LogResponse> getAllLogs(Pageable pageable);

    /**
     * Get logs for a specific user
     */
    Page<LogResponse> getUserLogs(UUID userId, Pageable pageable);

    /**
     * Get logs for a specific file
     */
    Page<LogResponse> getFileLogs(UUID fileId, Pageable pageable);

    /**
     * Advanced filtering: user, action, file, date range
     */
    Page<LogResponse> getFilteredLogs(LogFilterRequest filter, Pageable pageable);

    /**
     * Get logs within a date range
     */
    Page<LogResponse> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    /**
     * Export logs to CSV format
     */
    String exportLogsToCSV(LogFilterRequest filter);

    /**
     * Get statistics (count by action)
     */
    long getActionCount(String action);
}
