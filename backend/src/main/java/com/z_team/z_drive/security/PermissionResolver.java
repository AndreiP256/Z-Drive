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

    private final RolePermissionsRepository rolePermissionsRepository;

    /**
     * Returns true if the user has the requested permission on the file.
     */
    public boolean hasPermission(UUID userId, UUID fileId, Permission permission) {
        List<Permission> effective = rolePermissionsRepository
                .findPermissionsForUserOnFile(userId, fileId);
        return effective.contains(permission);
    }

    /**
     * Overload accepting a String permission name — useful in @PreAuthorize expressions.
     */
    public boolean hasPermission(UUID userId, UUID fileId, String permissionName) {
        return hasPermission(userId, fileId, Permission.valueOf(permissionName.toUpperCase()));
    }

    /**
     * Throws AccessDeniedException if the user does NOT have the required permission.
     * Call this at the start of any service method that mutates or reads protected resources.
     */
    public void requirePermission(UUID userId, UUID fileId, Permission permission) {
        if (!hasPermission(userId, fileId, permission)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    String.format("User %s does not have %s permission on file %s",
                            userId, permission, fileId));
        }
    }

    /**
     * Returns all permissions the user has on the file.
     */
    public List<Permission> getEffectivePermissions(UUID userId, UUID fileId) {
        return rolePermissionsRepository.findPermissionsForUserOnFile(userId, fileId);
    }
}
