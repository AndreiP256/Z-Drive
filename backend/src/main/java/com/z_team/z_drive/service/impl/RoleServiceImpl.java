package com.z_team.z_drive.service.impl;

import com.z_team.z_drive.dto.roles.*;
import com.z_team.z_drive.entity.User;
import com.z_team.z_drive.repository.UserRepository;
import com.z_team.z_drive.entity.*;
import com.z_team.z_drive.enums.*;
import com.z_team.z_drive.repository.*;
import com.z_team.z_drive.service.RoleService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final FileRoleRepository fileRoleRepository;
    private final RolePermissionsRepository rolePermissionsRepository;
    private final UsersWithFileRolesRepository usersWithFileRolesRepository;
    private final UserRepository userRepository;

    // ─── FileRole CRUD ─────────────────────────────────────────

    @Override
    @Transactional
    public FileRoleResponse createFileRole(CreateFileRoleRequest request) {
        FileRole role = fileRoleRepository.save(
                new FileRole(null, request.getName())
        );

        List<RolePermissions> perms = savePermissions(role, request.getFileId(), request.getPermissions());

        return toResponse(role, request.getFileId(), perms);
    }

    @Override
    @Transactional
    public void deleteFileRole(UUID fileRoleId) {
        FileRole role = findRoleOrThrow(fileRoleId);

        usersWithFileRolesRepository.deleteByFileRole_Id(fileRoleId);
        rolePermissionsRepository.deleteByFileRole_Id(fileRoleId);
        fileRoleRepository.delete(role);
    }

    @Override
    @Transactional
    public FileRoleResponse updateFileRole(UUID fileRoleId, UpdateFileRoleRequest request) {
        FileRole role = findRoleOrThrow(fileRoleId);

        if (request.getName() != null) {
            role.setName(request.getName());
        }

        List<RolePermissions> perms;

        if (request.getPermissions() != null && request.getFileId() != null) {
            rolePermissionsRepository.deleteByFileRole_Id(fileRoleId);
            perms = savePermissions(role, request.getFileId(), request.getPermissions());
        } else {
            perms = rolePermissionsRepository.findByFileRole_Id(fileRoleId);
        }

        UUID fileId = perms.isEmpty() ? null : perms.get(0).getFileId();

        return toResponse(role, fileId, perms);
    }

    @Override
    public List<UUID> getRoleFiles(UUID fileRoleId) {
        return rolePermissionsRepository.findByFileRole_Id(fileRoleId)
                .stream()
                .map(RolePermissions::getFileId)
                .distinct()
                .toList();
    }

    @Override
    public FileRoleResponse getFileRole(UUID fileRoleId) {
        FileRole role = findRoleOrThrow(fileRoleId);
        List<RolePermissions> perms = rolePermissionsRepository.findByFileRole_Id(fileRoleId);

        UUID fileId = perms.isEmpty() ? null : perms.get(0).getFileId();

        return toResponse(role, fileId, perms);
    }

    // ─── Assign role ─────────────────────────────────────────

    @Override
    @Transactional
    public UserRoleResponse assignRoleToUser(AssignRoleRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        FileRole role = findRoleOrThrow(request.getFileRoleId());

        if (usersWithFileRolesRepository.existsByUser_IdAndFileRole_Id(user.getId(), role.getId())) {
            return usersWithFileRolesRepository.findByUser_Id(user.getId()).stream()
                    .filter(u -> u.getFileRole().getId().equals(role.getId()))
                    .findFirst()
                    .map(this::toUserRoleResponse)
                    .orElseThrow();
        }

        UsersWithFileRoles assignment = usersWithFileRolesRepository.save(
                new UsersWithFileRoles(null, user, role)
        );

        return toUserRoleResponse(assignment);
    }

    @Override
    @Transactional
    public void revokeRoleFromUser(UUID userId, UUID fileRoleId) {
        usersWithFileRolesRepository.findByUser_Id(userId).stream()
                .filter(u -> u.getFileRole().getId().equals(fileRoleId))
                .findFirst()
                .ifPresent(usersWithFileRolesRepository::delete);
    }

    @Override
    public List<UserRoleResponse> getRolesForUser(UUID userId) {
        return usersWithFileRolesRepository.findByUser_Id(userId)
                .stream()
                .map(this::toUserRoleResponse)
                .toList();
    }

    @Override
    public List<Permission> getEffectivePermissions(UUID userId, UUID fileId) {
        return rolePermissionsRepository.findPermissionsForUserOnFile(userId, fileId);
    }

    // ─── Helpers ─────────────────────────────────────────

    private FileRole findRoleOrThrow(UUID id) {
        return fileRoleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FileRole not found"));
    }

    private List<RolePermissions> savePermissions(FileRole role, UUID fileId, List<Permission> permissions) {
        List<RolePermissions> entities = permissions.stream()
                .map(p -> new RolePermissions(null, role, fileId, p))
                .toList();

        return rolePermissionsRepository.saveAll(entities);
    }

    private FileRoleResponse toResponse(FileRole role, UUID fileId, List<RolePermissions> perms) {
        return FileRoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .fileId(fileId)
                .permissions(perms.stream().map(RolePermissions::getPermission).toList())
                .build();
    }

    private UserRoleResponse toUserRoleResponse(UsersWithFileRoles u) {
        return UserRoleResponse.builder()
                .id(u.getId())
                .userId(u.getUser().getId())
                .fileRoleId(u.getFileRole().getId())
                .fileRoleName(u.getFileRole().getName())
                .build();
    }
}