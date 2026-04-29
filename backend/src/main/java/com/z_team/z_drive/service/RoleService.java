package com.z_team.z_drive.service;

import com.z_team.z_drive.dto.roles.*;
import com.z_team.z_drive.enums.Permission;

import java.util.List;
import java.util.UUID;

public interface RoleService {

    FileRoleResponse createFileRole(CreateFileRoleRequest request);

    void deleteFileRole(UUID fileRoleId);

    FileRoleResponse updateFileRole(UUID fileRoleId, UpdateFileRoleRequest request);

    List<UUID> getRoleFiles(UUID fileRoleId);

    FileRoleResponse getFileRole(UUID fileRoleId);

    UserRoleResponse assignRoleToUser(AssignRoleRequest request);

    void revokeRoleFromUser(UUID userId, UUID fileRoleId);

    List<UserRoleResponse> getRolesForUser(UUID userId);

    List<Permission> getEffectivePermissions(UUID userId, UUID fileId);
}