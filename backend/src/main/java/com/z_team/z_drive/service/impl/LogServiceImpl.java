package com.z_team.z_drive.service.impl;

import com.z_team.z_drive.dto.logs.LogFilterRequest;
import com.z_team.z_drive.dto.logs.LogResponse;
import com.z_team.z_drive.entity.Log;
import com.z_team.z_drive.repository.LogRepository;
import com.z_team.z_drive.repository.UserRepository;
import com.z_team.z_drive.repository.FileRepository;
import com.z_team.z_drive.service.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LogServiceImpl implements LogService {

    private static final String PROFILE_PICTURE_PREFIX = "profile-pictures/";

    private final LogRepository logRepository;
    private final UserRepository userRepository;
    private final FileRepository fileRepository;

    /**
     * Log an action without file reference
     */
    @Override
    @Transactional
    public void logAction(UUID userId, String action, String details) {
        Log log = new Log(userId, action, details);
        logRepository.save(log);
    }

    /**
     * Log an action with file reference
     */
    @Override
    @Transactional
    public void logAction(UUID userId, String action, UUID fileId, String details) {
        if (shouldSkipLogging(action, fileId)) {
            return;
        }

        Log log = new Log(userId, action, fileId, details);
        logRepository.save(log);
    }

    /**
     * Log an action with custom status
     */
    @Override
    @Transactional
    public void logAction(UUID userId, String action, UUID fileId, String details, String status) {
        if (shouldSkipLogging(action, fileId)) {
            return;
        }

        Log log = new Log(userId, action, fileId, details);
        log.setStatus(status);
        logRepository.save(log);
    }

    /**
     * Get all logs with pagination (newest first)
     */
    @Override
    public Page<LogResponse> getAllLogs(Pageable pageable) {
        return logRepository.findAllOrderByTimestamp(pageable)
                .map(this::convertToResponse);
    }

    /**
     * Get logs for a specific user
     */
    @Override
    public Page<LogResponse> getUserLogs(UUID userId, Pageable pageable) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(30);

        return logRepository.findByUserIdAndDateRange(userId, startDate, endDate, pageable)
                .map(this::convertToResponse);
    }

    /**
     * Get logs for a specific file
     */
    @Override
    public Page<LogResponse> getFileLogs(UUID fileId, Pageable pageable) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(30);

        return logRepository.findByFilters(null, null, fileId, startDate, endDate, pageable)
                .map(this::convertToResponse);
    }

    /**
     * Advanced filtering: user, action, file, date range
     */
    @Override
    public Page<LogResponse> getFilteredLogs(LogFilterRequest filter, Pageable pageable) {
        filter.applyDefaults();

        return logRepository.findByFilters(
                filter.getUserId(),
                filter.getAction(),
                filter.getFileId(),
                filter.getStartDate(),
                filter.getEndDate(),
                pageable
        ).map(this::convertToResponse);
    }

    /**
     * Get logs within a date range
     */
    @Override
    public Page<LogResponse> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return logRepository.findByDateRange(startDate, endDate, pageable)
                .map(this::convertToResponse);
    }

    /**
     * Export logs to CSV format
     */
    @Override
    public String exportLogsToCSV(LogFilterRequest filter) {
        filter.applyDefaults();

        var logs = logRepository.findByFilters(
                filter.getUserId(),
                filter.getAction(),
                filter.getFileId(),
                filter.getStartDate(),
                filter.getEndDate(),
                org.springframework.data.domain.Pageable.unpaged()
        ).getContent();

        StringBuilder csv = new StringBuilder();
        csv.append("ID,User ID,User Name,Action,File ID,File Name,Details,Timestamp,IP Address,Status\n");

        for (Log log : logs) {
            csv.append(String.format(
                    "%s,%s,%s,%s,%s,%s,\"%s\",%s,%s,%s\n",
                    log.getId(),
                    log.getUserId(),
                    getUserName(log.getUserId()),
                    log.getAction(),
                    log.getFileId() != null ? log.getFileId() : "",
                    log.getFileId() != null ? getFileName(log.getFileId()) : "",
                    escapeCSV(log.getDetails()),
                    log.getTimestamp(),
                    log.getIpAddress() != null ? log.getIpAddress() : "",
                    log.getStatus()
            ));
        }

        return csv.toString();
    }

    /**
     * Get count of actions by type
     */
    @Override
    public long getActionCount(String action) {
        return logRepository.countByAction(action);
    }

    // ────── Helper Methods ──────

    /**
     * Convert Log entity to LogResponse DTO
     */
    private LogResponse convertToResponse(Log log) {
        return LogResponse.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .userName(getUserName(log.getUserId()))
                .action(log.getAction())
                .fileId(log.getFileId())
                .fileName(log.getFileId() != null ? getFileName(log.getFileId()) : null)
                .details(log.getDetails())
                .timestamp(log.getTimestamp())
                .ipAddress(log.getIpAddress())
                .status(log.getStatus())
                .build();
    }

    /**
     * Get user name by ID
     */
    private String getUserName(UUID userId) {
        return userRepository.findById(userId)
                .map(u -> u.getName() != null ? u.getName() : u.getEmail())
                .orElse("Unknown User");
    }

    /**
     * Get file name by ID
     */
    private String getFileName(UUID fileId) {
        return fileRepository.findById(fileId)
                .map(f -> f.getName())
                .orElse("Unknown File");
    }

    private boolean shouldSkipLogging(String action, UUID fileId) {
        if (!"DOWNLOAD".equalsIgnoreCase(action) || fileId == null) {
            return false;
        }

        return fileRepository.findById(fileId)
                .map(file -> file.getFileLocation() != null
                        && file.getFileLocation().startsWith(PROFILE_PICTURE_PREFIX))
                .orElse(false);
    }

    /**
     * Escape CSV special characters
     */
    private String escapeCSV(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}
