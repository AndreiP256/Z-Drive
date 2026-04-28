package com.z_team.z_drive.service.impl;

import com.z_team.z_drive.service.LogService;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class LogServiceImpl implements LogService {

    @Override
    public void logAction(UUID userId, String action, String details) {
        // TODO: implement later
    }
}