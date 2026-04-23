package com.z_team.z_drive.service;

import java.util.UUID;

public interface LogService {
    void logAction(UUID userId, String action, String details);
}