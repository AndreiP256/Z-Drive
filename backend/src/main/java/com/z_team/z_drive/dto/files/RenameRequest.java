package com.z_team.z_drive.dto.files;

import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RenameRequest {

    @NotBlank(message = "New name is required")
    private String newName;

    @NotNull(message = "User ID is required")
    private UUID userId;
}