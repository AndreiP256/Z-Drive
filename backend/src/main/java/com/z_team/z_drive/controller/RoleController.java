package com.z_team.z_drive.controller;

import com.z_team.z_drive.dto.roles.*;
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
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
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
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<FileRoleResponse> updateFileRole(
            @PathVariable UUID roleId,
            @RequestBody UpdateFileRoleRequest request) {
        return ResponseEntity.ok(roleService.updateFileRole(roleId, request));
    }

    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteFileRole(@PathVariable UUID roleId) {
        roleService.deleteFileRole(roleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{roleId}/files")
    public ResponseEntity<List<UUID>> getRoleFiles(@PathVariable UUID roleId) {
        return ResponseEntity.ok(roleService.getRoleFiles(roleId));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<UserRoleResponse> assignRole(
            @RequestBody AssignRoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roleService.assignRoleToUser(request));
    }

    @DeleteMapping("/assign")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> revokeRole(
            @RequestParam UUID userId,
            @RequestParam UUID fileRoleId) {
        roleService.revokeRoleFromUser(userId, fileRoleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<UserRoleResponse>> getUserRoles(@PathVariable UUID userId) {
        return ResponseEntity.ok(roleService.getRolesForUser(userId));
    }

    @GetMapping("/permissions")
    public ResponseEntity<List<Permission>> getEffectivePermissions(
            @RequestParam UUID userId,
            @RequestParam UUID fileId) {
        return ResponseEntity.ok(roleService.getEffectivePermissions(userId, fileId));
    }
}
