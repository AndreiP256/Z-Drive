package com.z_team.z_drive.repository;

import com.z_team.z_drive.entity.FileRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FileRoleRepository extends JpaRepository<FileRole, UUID> {
    Optional<FileRole> findByName(String name);
}
