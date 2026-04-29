package com.z_team.z_drive.repository;

import com.z_team.z_drive.enums.Permission;
import com.z_team.z_drive.entity.RolePermissions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RolePermissionsRepository extends JpaRepository<RolePermissions, UUID> {

    List<RolePermissions> findByFileRole_Id(UUID fileRoleId);

    void deleteByFileRole_Id(UUID fileRoleId);

    List<RolePermissions> findByFileRole_IdAndFileId(UUID fileRoleId, UUID fileId);

    boolean existsByFileRole_IdAndFileIdAndPermission(UUID fileRoleId, UUID fileId, Permission permission);

    List<Permission> findPermissionsForUserOnFile(UUID userId, UUID fileId);
}