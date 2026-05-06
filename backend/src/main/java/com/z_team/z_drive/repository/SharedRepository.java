package com.z_team.z_drive.repository;

import com.z_team.z_drive.entity.Shared;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SharedRepository extends JpaRepository<Shared, UUID> {

    Optional<Shared> findByFileId(UUID fileId);

    boolean existsByFileId(UUID fileId);

    void deleteByFileId(UUID fileId);
}