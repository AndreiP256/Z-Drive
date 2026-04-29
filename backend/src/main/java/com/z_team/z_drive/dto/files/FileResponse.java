package com.z_team.z_drive.dto.files;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class FileResponse {
    private UUID id;
    private String name;
    private String type;
    private float size;
    private UUID parentId;
    private UUID ownerId;
}