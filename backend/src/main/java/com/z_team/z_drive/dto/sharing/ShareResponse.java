package com.z_team.z_drive.dto.sharing;

import com.z_team.z_drive.enums.ShareAccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShareResponse {

    private UUID sharedId;
    private UUID fileId;
    private UUID targetUserId;
    private String link;
    private ShareAccessLevel accessLevel;
}