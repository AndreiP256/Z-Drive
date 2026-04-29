package com.z_team.z_drive.dto.roles;

import com.z_team.z_drive.enums.Permission;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PermissionCheckResponse {
    private UUID userId;
    private UUID fileId;
    private Permission permission;
    private boolean granted;
}