package com.z_team.z_drive.dto.roles.requests;

import com.z_team.z_drive.enums.Permission;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateFileRoleRequest {
    private String name;
    private UUID fileId;
    private List<Permission> permissions;
}