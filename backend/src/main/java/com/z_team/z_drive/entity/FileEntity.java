package com.z_team.z_drive.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Entity
@Table(name = "files")
@Getter
@Setter
public class FileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "file_location", nullable = false)
    private String fileLocation;

    @Column(nullable = false)
    private String name;

    @Column
    private Float size;

    @Column
    private String type;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "parent")
    private UUID parent;

    @Column(name = "is_folder", nullable = false)
    private Boolean isFolder;

    // Note: Relationships like SharedWithUser or RolePermissions would 
    // typically be mapped here as @OneToMany or @ManyToMany collections.
}