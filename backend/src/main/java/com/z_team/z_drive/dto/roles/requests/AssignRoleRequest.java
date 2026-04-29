package com.z_team.z_drive.dto.roles.requests;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AssignRoleRequest {
    private UUID userId;
    private UUID fileRoleId;
}