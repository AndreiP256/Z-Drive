package com.z_team.z_drive.repository;

import com.z_team.z_drive.entity.SharedWithUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SharedWithUserRepository extends JpaRepository<SharedWithUser, UUID> {

    List<SharedWithUser> findByShared_Id(UUID sharedId);

    List<SharedWithUser> findByUser_Id(UUID userId);

    Optional<SharedWithUser> findByShared_IdAndUser_Id(UUID sharedId, UUID userId);

    Optional<SharedWithUser> findByLink(String link);

    boolean existsByShared_IdAndUser_Id(UUID sharedId, UUID userId);

    long countByShared_Id(UUID sharedId);

    void deleteByShared_IdAndUser_Id(UUID sharedId, UUID userId);
}