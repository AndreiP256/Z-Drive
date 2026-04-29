package com.z_team.z_drive.dto.roles;

import com.z_team.z_drive.enums.Permission;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class FileRoleResponse {
    private UUID id;
    private String name;
    private UUID fileId;
    private List<Permission> permissions;
}