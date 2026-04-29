package com.z_team.z_drive.dto.files;

import java.util.UUID;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MoveRequest {

    @NotNull(message = "Target folder ID is required")
    private UUID newParentId;

    @NotNull(message = "User ID is required for authorization")
    private UUID userId;
}