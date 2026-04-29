package com.z_team.z_drive.controller;

import com.z_team.z_drive.dto.roles.*;
import com.z_team.z_drive.dto.roles.requests.AssignRoleRequest;
import com.z_team.z_drive.dto.roles.requests.CreateFileRoleRequest;
import com.z_team.z_drive.dto.roles.requests.PermissionRequest;
import com.z_team.z_drive.dto.roles.requests.RevokeRoleRequest;
import com.z_team.z_drive.dto.roles.requests.UpdateFileRoleRequest;
import com.z_team.z_drive.dto.roles.responses.FileRoleResponse;
import com.z_team.z_drive.dto.roles.responses.RevokeRoleResponse;
import com.z_team.z_drive.dto.roles.responses.UserRoleResponse;
import com.z_team.z_drive.enums.Permission;
import com.z_team.z_drive.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<FileRoleResponse> createFileRole(
            @RequestBody CreateFileRoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roleService.createFileRole(request));
    }

    @GetMapping("/{roleId}")
    public ResponseEntity<FileRoleResponse> getFileRole(@PathVariable UUID roleId) {
        return ResponseEntity.ok(roleService.getFileRole(roleId));
    }

    @PutMapping("/{roleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<FileRoleResponse> updateFileRole(
            @PathVariable UUID roleId,
            @RequestBody UpdateFileRoleRequest request) {
        return ResponseEntity.ok(roleService.updateFileRole(roleId, request));
    }

    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteFileRole(@PathVariable UUID roleId) {
        roleService.deleteFileRole(roleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{roleId}/files")
    public ResponseEntity<List<UUID>> getRoleFiles(@PathVariable UUID roleId) {
        return ResponseEntity.ok(roleService.getRoleFiles(roleId));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<UserRoleResponse> assignRole(
            @RequestBody AssignRoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roleService.assignRoleToUser(request));
    }

    @DeleteMapping("/revoke")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<RevokeRoleResponse> revokeRole(
            @RequestBody RevokeRoleRequest request) {
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(roleService.revokeRoleFromUser(request));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<UserRoleResponse>> getUserRoles(@PathVariable UUID userId) {
        return ResponseEntity.ok(roleService.getRolesForUser(userId));
    }

    @GetMapping("/permissions")
    public ResponseEntity<List<Permission>> getEffectivePermissions(
           @RequestBody PermissionRequest request) {
        return ResponseEntity.ok(roleService.getEffectivePermissions(request));
    }
}
