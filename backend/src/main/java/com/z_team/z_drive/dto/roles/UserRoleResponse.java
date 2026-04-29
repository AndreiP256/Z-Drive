package com.z_team.z_drive.dto.roles;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UserRoleResponse {
    private UUID id;
    private UUID userId;
    private UUID fileRoleId;
    private String fileRoleName;
}