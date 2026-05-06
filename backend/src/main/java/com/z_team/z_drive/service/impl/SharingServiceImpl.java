package com.z_team.z_drive.service.impl;

import com.z_team.z_drive.dto.sharing.RevokeShareRequest;
import com.z_team.z_drive.dto.sharing.ShareFileRequest;
import com.z_team.z_drive.dto.sharing.ShareResponse;
import com.z_team.z_drive.entity.FileEntity;
import com.z_team.z_drive.entity.FileRole;
import com.z_team.z_drive.entity.RolePermissions;
import com.z_team.z_drive.entity.Shared;
import com.z_team.z_drive.entity.SharedWithUser;
import com.z_team.z_drive.entity.User;
import com.z_team.z_drive.entity.UsersWithFileRoles;
import com.z_team.z_drive.enums.Permission;
import com.z_team.z_drive.enums.Role;
import com.z_team.z_drive.enums.ShareAccessLevel;
import com.z_team.z_drive.repository.FileRepository;
import com.z_team.z_drive.repository.FileRoleRepository;
import com.z_team.z_drive.repository.RolePermissionsRepository;
import com.z_team.z_drive.repository.SharedRepository;
import com.z_team.z_drive.repository.SharedWithUserRepository;
import com.z_team.z_drive.repository.UserRepository;
import com.z_team.z_drive.repository.UsersWithFileRolesRepository;
import com.z_team.z_drive.security.SecurityUtils;
import com.z_team.z_drive.service.LogService;
import com.z_team.z_drive.service.SharingService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SharingServiceImpl implements SharingService {

    private final SharedRepository sharedRepository;
    private final SharedWithUserRepository sharedWithUserRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final FileRoleRepository fileRoleRepository;
    private final RolePermissionsRepository rolePermissionsRepository;
    private final UsersWithFileRolesRepository usersWithFileRolesRepository;
    private final LogService logService;

    @Override
    @Transactional
    public ShareResponse shareFile(ShareFileRequest request) {
        validateShareRequest(request);

        UUID actorId = SecurityUtils.getCurrentUserId();
        String actorEmail = SecurityUtils.getCurrentUserEmail();

        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));

        FileEntity file = fileRepository.findById(request.getFileId())
                .orElseThrow(() -> new EntityNotFoundException("File not found"));

        User targetUser = userRepository.findById(request.getTargetUserId())
                .orElseThrow(() -> new EntityNotFoundException("Target user not found"));

        validateShareRights(actor, file);

        if (actorId.equals(targetUser.getId())) {
            throw new IllegalArgumentException("You cannot share a file with yourself");
        }

        Shared shared = sharedRepository.findByFileId(file.getId())
                .orElseGet(() -> sharedRepository.save(new Shared(null, file.getId())));

        String shareRoleName = buildShareRoleName(file.getId(), targetUser.getId());

        FileRole fileRole = fileRoleRepository.findByName(shareRoleName)
                .orElseGet(() -> fileRoleRepository.save(new FileRole(null, shareRoleName)));

        syncRolePermissions(fileRole, file.getId(), request.getAccessLevel());
        ensureRoleAssignedToUser(targetUser, fileRole);

        SharedWithUser sharedWithUser = sharedWithUserRepository
                .findByShared_IdAndUser_Id(shared.getId(), targetUser.getId())
                .orElseGet(() -> {
                    SharedWithUser newShare = new SharedWithUser();
                    newShare.setUser(targetUser);
                    newShare.setShared(shared);
                    newShare.setLink(generateShareLinkToken());
                    return newShare;
                });

        SharedWithUser savedShare = sharedWithUserRepository.save(sharedWithUser);

        logService.logAction(
                actorId,
                "SHARE_FILE",
                "User " + actorEmail + " shared file " + file.getId() +
                        " with user " + targetUser.getEmail() +
                        " using access level " + request.getAccessLevel()
        );

        return new ShareResponse(
                shared.getId(),
                file.getId(),
                targetUser.getId(),
                savedShare.getLink(),
                request.getAccessLevel()
        );
    }

    @Override
    @Transactional
    public void revokeShare(RevokeShareRequest request) {
        validateRevokeRequest(request);

        UUID actorId = SecurityUtils.getCurrentUserId();
        String actorEmail = SecurityUtils.getCurrentUserEmail();

        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));

        FileEntity file = fileRepository.findById(request.getFileId())
                .orElseThrow(() -> new EntityNotFoundException("File not found"));

        validateShareRights(actor, file);

        Shared shared = sharedRepository.findByFileId(file.getId())
                .orElseThrow(() -> new EntityNotFoundException("No share configuration found for file"));

        SharedWithUser sharedWithUser = sharedWithUserRepository
                .findByShared_IdAndUser_Id(shared.getId(), request.getTargetUserId())
                .orElseThrow(() -> new EntityNotFoundException("This file is not shared with the target user"));

        sharedWithUserRepository.delete(sharedWithUser);

        String shareRoleName = buildShareRoleName(file.getId(), request.getTargetUserId());

        fileRoleRepository.findByName(shareRoleName).ifPresent(fileRole -> {
            usersWithFileRolesRepository.findByUser_Id(request.getTargetUserId()).stream()
                    .filter(assignment -> assignment.getFileRole().getId().equals(fileRole.getId()))
                    .forEach(usersWithFileRolesRepository::delete);

            rolePermissionsRepository.deleteByFileRole_Id(fileRole.getId());
            fileRoleRepository.delete(fileRole);
        });

        if (sharedWithUserRepository.countByShared_Id(shared.getId()) == 0) {
            sharedRepository.delete(shared);
        }

        logService.logAction(
                actorId,
                "REVOKE_SHARE",
                "User " + actorEmail + " revoked sharing for file " + file.getId() +
                        " from user " + request.getTargetUserId()
        );
    }

    @Override
    public String getShareLink(UUID fileId, UUID targetUserId) {
        if (fileId == null) {
            throw new IllegalArgumentException("File ID cannot be null");
        }

        if (targetUserId == null) {
            throw new IllegalArgumentException("Target user ID cannot be null");
        }

        Shared shared = sharedRepository.findByFileId(fileId)
                .orElseThrow(() -> new EntityNotFoundException("No share configuration found for file"));

        SharedWithUser sharedWithUser = sharedWithUserRepository
                .findByShared_IdAndUser_Id(shared.getId(), targetUserId)
                .orElseThrow(() -> new EntityNotFoundException("This file is not shared with the target user"));

        return sharedWithUser.getLink();
    }

    private void validateShareRequest(ShareFileRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Share request cannot be null");
        }

        if (request.getFileId() == null) {
            throw new IllegalArgumentException("File ID cannot be null");
        }

        if (request.getTargetUserId() == null) {
            throw new IllegalArgumentException("Target user ID cannot be null");
        }

        if (request.getAccessLevel() == null) {
            throw new IllegalArgumentException("Share access level cannot be null");
        }
    }

    private void validateRevokeRequest(RevokeShareRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Revoke request cannot be null");
        }

        if (request.getFileId() == null) {
            throw new IllegalArgumentException("File ID cannot be null");
        }

        if (request.getTargetUserId() == null) {
            throw new IllegalArgumentException("Target user ID cannot be null");
        }
    }

    private void validateShareRights(User actor, FileEntity file) {
        boolean isOwner = file.getOwnerId().equals(actor.getId());
        boolean isAdmin = actor.getRole() == Role.ADMIN;
        boolean isManager = actor.getRole() == Role.MANAGER;

        if (!(isOwner || isAdmin || isManager)) {
            throw new SecurityException("You are not allowed to share this file");
        }
    }

    private void syncRolePermissions(FileRole fileRole, UUID fileId, ShareAccessLevel accessLevel) {
        rolePermissionsRepository.deleteByFileRole_Id(fileRole.getId());

        List<Permission> permissions = switch (accessLevel) {
            case VIEWER -> List.of(Permission.READ);
            case EDITOR -> List.of(Permission.READ, Permission.WRITE);
        };

        List<RolePermissions> permissionEntities = permissions.stream()
                .map(permission -> new RolePermissions(null, fileRole, fileId, permission))
                .toList();

        rolePermissionsRepository.saveAll(permissionEntities);
    }

    private void ensureRoleAssignedToUser(User targetUser, FileRole fileRole) {
        if (!usersWithFileRolesRepository.existsByUser_IdAndFileRole_Id(targetUser.getId(), fileRole.getId())) {
            usersWithFileRolesRepository.save(new UsersWithFileRoles(null, targetUser, fileRole));
        }
    }

    private String buildShareRoleName(UUID fileId, UUID targetUserId) {
        return "SHARE_" + fileId + "_" + targetUserId;
    }

    private String generateShareLinkToken() {
        return "/sharing/access/" + UUID.randomUUID();
    }
}