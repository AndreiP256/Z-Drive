package com.z_team.z_drive.dto.roles;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AssignRoleRequest {
    private UUID userId;
    private UUID fileRoleId;
}