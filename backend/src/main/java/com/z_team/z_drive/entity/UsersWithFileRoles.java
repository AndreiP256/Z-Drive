package com.z_team.z_drive.entity;

import com.z_team.z_drive.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users_with_file_roles",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "file_role_id"}))
public class UsersWithFileRoles {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_role_id", nullable = false)
    private FileRole fileRole;
}