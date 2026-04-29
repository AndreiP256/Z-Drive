package com.z_team.z_drive.dto.files;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DowloadRequest {
    @NotNull(message = "File ID is required")
    private UUID fileId;

    @NotNull(message = "User ID is required")
    private UUID userId;
}