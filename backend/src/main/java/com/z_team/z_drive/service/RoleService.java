package com.z_team.z_drive.service;

import com.z_team.z_drive.dto.roles.requests.AssignRoleRequest;
import com.z_team.z_drive.dto.roles.requests.CreateFileRoleRequest;
import com.z_team.z_drive.dto.roles.requests.PermissionRequest;
import com.z_team.z_drive.dto.roles.requests.RevokeRoleRequest;
import com.z_team.z_drive.dto.roles.requests.UpdateFileRoleRequest;
import com.z_team.z_drive.dto.roles.responses.FileRoleResponse;
import com.z_team.z_drive.dto.roles.responses.RevokeRoleResponse;
import com.z_team.z_drive.dto.roles.responses.UserRoleResponse;
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

    RevokeRoleResponse revokeRoleFromUser(RevokeRoleRequest request);

    List<UserRoleResponse> getRolesForUser(UUID userId);

    List<Permission> getEffectivePermissions(PermissionRequest request);
}