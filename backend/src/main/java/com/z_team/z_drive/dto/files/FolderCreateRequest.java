package com.z_team.z_drive.dto.files;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FolderCreateRequest {

    @NotNull(message = "Folder name is required")
    private String folderName;

    private UUID parentDirId;
}