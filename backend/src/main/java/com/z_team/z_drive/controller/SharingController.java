package com.z_team.z_drive.controller;

import com.z_team.z_drive.dto.sharing.RevokeShareRequest;
import com.z_team.z_drive.dto.sharing.ShareFileRequest;
import com.z_team.z_drive.dto.sharing.ShareResponse;
import com.z_team.z_drive.security.SecurityUtils;
import com.z_team.z_drive.service.SharingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/sharing")
public class SharingController {

    private final SharingService sharingService;

    public SharingController(SharingService sharingService) {
        this.sharingService = sharingService;
    }

    @PostMapping
    public ResponseEntity<ShareResponse> shareFile(@RequestBody ShareFileRequest request) {
        ShareResponse response = sharingService.shareFile(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping
    public ResponseEntity<Void> revokeShare(@RequestBody RevokeShareRequest request) {
        sharingService.revokeShare(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/link")
    public ResponseEntity<Map<String, String>> getShareLink(
            @RequestParam UUID fileId,
            @RequestParam UUID targetUserId) {

        String link = sharingService.getShareLink(fileId, targetUserId);
        return ResponseEntity.ok(Map.of("link", link));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> testSharingAccess() {
        return ResponseEntity.ok(Map.of(
                "message", "Sharing controller is working",
                "currentUserId", SecurityUtils.getCurrentUserId().toString()
        ));
    }
}