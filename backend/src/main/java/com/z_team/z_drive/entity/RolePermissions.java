package com.z_team.z_drive.entity;

import com.z_team.z_drive.enums.Permission;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "role_permissions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"file_role_id", "file_id", "permission"}))
public class RolePermissions {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_role_id", nullable = false)
    private FileRole fileRole;

    @Column(name = "file_id", nullable = false)
    private UUID fileId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Permission permission;
}