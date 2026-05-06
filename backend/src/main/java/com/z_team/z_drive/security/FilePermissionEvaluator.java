package com.z_team.z_drive.security;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.z_team.z_drive.dto.roles.requests.PermissionRequest;
import com.z_team.z_drive.entity.FileEntity;
import com.z_team.z_drive.enums.Permission;
import com.z_team.z_drive.repository.FileRepository;
import com.z_team.z_drive.service.RoleService;


@Component("fileSecurity")
public class FilePermissionEvaluator {


    private final FileRepository fileRepository;
    private final RoleService roleService;

    @Autowired
    public FilePermissionEvaluator(FileRepository fileRepository, RoleService roleService) {
        this.fileRepository = fileRepository;
        this.roleService = roleService;
    }


    public boolean canAccess(UUID fileId, UUID currentUserId, String permissionType) {
        if (SecurityUtils.isCurrentUserAdmin()) {
            return true;
        }

        FileEntity file = fileRepository.findById(fileId)
            .orElseThrow(() -> new RuntimeException("File not found"));

        if (file.getOwnerId().equals(currentUserId)) {
            return true;
        }

        PermissionRequest permissionRequest = new PermissionRequest(currentUserId, fileId);
        List<Permission> permissions = roleService.getEffectivePermissions(permissionRequest);
        if ("WRITE".equals(permissionType)) {
            return permissions.contains(Permission.WRITE);
        }
        if ("READ".equals(permissionType)) {
            return permissions.contains(Permission.READ);
        }
        if ("DELETE".equals(permissionType)) {
            return permissions.contains(Permission.DELETE);
        }

        return false;
    }
}