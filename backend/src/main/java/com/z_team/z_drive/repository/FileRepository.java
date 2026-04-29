package com.z_team.z_drive.repository;

import com.z_team.z_drive.entity.FileEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;


@Repository
public interface FileRepository extends JpaRepository<FileEntity, UUID> {
    List<FileEntity> findByOwnerId(UUID ownerId);
    List<FileEntity> findByParent(UUID parentId);
}