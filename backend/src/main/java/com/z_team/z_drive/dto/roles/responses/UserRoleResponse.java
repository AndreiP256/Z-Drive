package com.z_team.z_drive.dto.roles.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserRoleResponse {
    private UUID id;
    private UUID userId;
    private UUID fileRoleId;
    private String fileRoleName;
}