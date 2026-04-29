package com.z_team.z_drive.security;

import com.z_team.z_drive.enums.Permission;
import com.z_team.z_drive.repository.RolePermissionsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component("permissionResolver")
@RequiredArgsConstructor
public class PermissionResolver {

    // Change this from Repository to Service
    private final com.z_team.z_drive.service.RoleService roleService;

    public boolean hasPermission(UUID userId, UUID fileId, Permission permission) {
        // Use the logic we just fixed in the Service
        List<Permission> effective = roleService.getEffectivePermissions(userId, fileId);
        return effective.contains(permission);
    }

    public boolean hasPermission(UUID userId, UUID fileId, String permissionName) {
        return hasPermission(userId, fileId, Permission.valueOf(permissionName.toUpperCase()));
    }

    public void requirePermission(UUID userId, UUID fileId, Permission permission) {
        if (!hasPermission(userId, fileId, permission)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    String.format("User %s does not have %s permission on file %s",
                            userId, permission, fileId));
        }
    }

    public List<Permission> getEffectivePermissions(UUID userId, UUID fileId) {
        return roleService.getEffectivePermissions(userId, fileId);
    }
}
