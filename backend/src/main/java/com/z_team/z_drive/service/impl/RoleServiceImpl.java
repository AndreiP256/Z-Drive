package com.z_team.z_drive.service.impl;

import com.z_team.z_drive.dto.roles.requests.AssignRoleRequest;
import com.z_team.z_drive.dto.roles.requests.CreateFileRoleRequest;
import com.z_team.z_drive.dto.roles.requests.PermissionRequest;
import com.z_team.z_drive.dto.roles.requests.RevokeRoleRequest;
import com.z_team.z_drive.dto.roles.requests.UpdateFileRoleRequest;
import com.z_team.z_drive.dto.roles.responses.FileRoleResponse;
import com.z_team.z_drive.dto.roles.responses.RevokeRoleResponse;
import com.z_team.z_drive.dto.roles.responses.UserRoleResponse;
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

		if (request.getName() != null && !request.getName().isBlank()) {
			role.setName(request.getName());
		}

		List<RolePermissions> existingPerms = rolePermissionsRepository.findByFileRole_Id(fileRoleId);

		UUID targetFileId = request.getFileId();
		if (targetFileId == null && !existingPerms.isEmpty()) {
			targetFileId = existingPerms.get(0).getFileId();
		}

		List<RolePermissions> perms;

		if (request.getPermissions() != null && targetFileId != null) {
			rolePermissionsRepository.deleteAll(existingPerms);
			rolePermissionsRepository.flush();

			List<Permission> distinctPermissions = request.getPermissions()
					.stream()
					.distinct()
					.toList();

			perms = savePermissions(role, targetFileId, distinctPermissions);
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
    public RevokeRoleResponse revokeRoleFromUser(RevokeRoleRequest request) {
        UUID userId = request.getUserId();
        UUID fileRoleId = request.getFileRoleId();
        usersWithFileRolesRepository.findByUser_Id(userId).stream()
                .filter(u -> u.getFileRole().getId().equals(fileRoleId))
                .findFirst()
                .ifPresent(usersWithFileRolesRepository::delete);
        return RevokeRoleResponse.builder()
            .userId(userId)
            .fileRoleId(fileRoleId)
            .build();
    }

    @Override
    public List<UserRoleResponse> getRolesForUser(UUID userId) {
        return usersWithFileRolesRepository.findByUser_Id(userId)
                .stream()
                .map(this::toUserRoleResponse)
                .toList();
    }

   @Override
    public List<Permission> getEffectivePermissions(PermissionRequest request) {
        UUID userId = request.getUserId();
        UUID fileId = request.getFileId();
        List<UsersWithFileRoles> userRoles = usersWithFileRolesRepository.findByUser_Id(userId);

        return userRoles.stream()
                .map(assignment -> assignment.getFileRole().getId())
                .flatMap(roleId -> rolePermissionsRepository.findByFileRole_IdAndFileId(roleId, fileId).stream())
                .map(RolePermissions::getPermission)
                .distinct()
                .toList();
    }

    // ─── Helpers ─────────────────────────────────────────

    private FileRole findRoleOrThrow(UUID id) {
        return fileRoleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FileRole not found"));
    }

    private List<RolePermissions> savePermissions(FileRole role, UUID fileId, List<Permission> permissions) {
		List<RolePermissions> entities = permissions.stream()
				.distinct()
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