package com.z_team.z_drive.dto.sharing;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RevokeShareRequest {

    private UUID fileId;
    private UUID targetUserId;
}