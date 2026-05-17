package com.z_team.z_drive.repository;

import com.z_team.z_drive.entity.Log;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface LogRepository extends JpaRepository<Log, UUID> {

    /**
     * Find all logs for a specific user
     */
    List<Log> findByUserId(UUID userId);

    /**
     * Find logs for a specific file
     */
    List<Log> findByFileId(UUID fileId);

    /**
     * Find logs by action type
     */
    List<Log> findByAction(String action);

    /**
     * Find logs within a date range with pagination
     */
    @Query("SELECT l FROM Log l WHERE l.timestamp BETWEEN :startDate AND :endDate ORDER BY l.timestamp DESC")
    Page<Log> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * Find logs by user and date range
     */
    @Query("SELECT l FROM Log l WHERE l.userId = :userId AND l.timestamp BETWEEN :startDate AND :endDate ORDER BY l.timestamp DESC")
    Page<Log> findByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * Find logs by action and date range
     */
    @Query("SELECT l FROM Log l WHERE l.action = :action AND l.timestamp BETWEEN :startDate AND :endDate ORDER BY l.timestamp DESC")
    Page<Log> findByActionAndDateRange(
            @Param("action") String action,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * Complex query: filter by user, action, file, and date range
     */
    @Query("SELECT l FROM Log l WHERE " +
            "(:userId IS NULL OR l.userId = :userId) AND " +
            "(:action IS NULL OR l.action = :action) AND " +
            "(:fileId IS NULL OR l.fileId = :fileId) AND " +
            "l.timestamp BETWEEN :startDate AND :endDate " +
            "ORDER BY l.timestamp DESC")
    Page<Log> findByFilters(
            @Param("userId") UUID userId,
            @Param("action") String action,
            @Param("fileId") UUID fileId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * Get all logs ordered by timestamp (descending)
     */
    @Query("SELECT l FROM Log l ORDER BY l.timestamp DESC")
    Page<Log> findAllOrderByTimestamp(Pageable pageable);

    /**
     * Count logs by action (for statistics)
     */
    long countByAction(String action);

    /**
     * Count logs by user
     */
    long countByUserId(UUID userId);
}
