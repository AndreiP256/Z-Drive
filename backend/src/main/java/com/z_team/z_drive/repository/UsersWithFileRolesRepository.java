package com.z_team.z_drive.repository;

import com.z_team.z_drive.entity.UsersWithFileRoles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UsersWithFileRolesRepository extends JpaRepository<UsersWithFileRoles, UUID> {

    List<UsersWithFileRoles> findByUser_Id(UUID userId);

    List<UsersWithFileRoles> findByFileRole_Id(UUID fileRoleId);

    void deleteByFileRole_Id(UUID fileRoleId);

    boolean existsByUser_IdAndFileRole_Id(UUID userId, UUID fileRoleId);
}