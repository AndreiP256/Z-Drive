package com.z_team.z_drive.dto.roles.responses;

import com.z_team.z_drive.enums.Permission;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PermissionCheckResponse {
    private UUID userId;
    private UUID fileId;
    private Permission permission;
    private boolean granted;
}