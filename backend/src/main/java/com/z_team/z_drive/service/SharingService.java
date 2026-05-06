package com.z_team.z_drive.service;

import com.z_team.z_drive.dto.sharing.RevokeShareRequest;
import com.z_team.z_drive.dto.sharing.ShareFileRequest;
import com.z_team.z_drive.dto.sharing.ShareResponse;

import java.util.UUID;

public interface SharingService {

    ShareResponse shareFile(ShareFileRequest request);

    void revokeShare(RevokeShareRequest request);

    String getShareLink(UUID fileId, UUID targetUserId);
}