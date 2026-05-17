package com.z_team.z_drive.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.z_team.z_drive.dto.files.FileResponse;
import com.z_team.z_drive.dto.files.FileUploadRequest;
import com.z_team.z_drive.dto.files.FolderCreateRequest;
import com.z_team.z_drive.dto.files.MoveRequest;
import com.z_team.z_drive.dto.files.RenameRequest;
import com.z_team.z_drive.entity.FileEntity;
import com.z_team.z_drive.security.SecurityUtils;
import com.z_team.z_drive.security.UserPrincipal;
import com.z_team.z_drive.security.annotations.HasDeletePermission;
import com.z_team.z_drive.security.annotations.HasReadPermission;
import com.z_team.z_drive.security.annotations.HasWritePermission;
import com.z_team.z_drive.service.FileService;

import jakarta.validation.Valid;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/files")
public class FileController {

    private final FileService fileService;

    @Autowired
    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @GetMapping("/myFiles")
    public ResponseEntity<List<FileEntity>> getMyFiles(@AuthenticationPrincipal UserPrincipal principal) {
        System.out.println(principal.id());
        List<FileEntity> files = fileService.listOwnedFiles(principal.id());
        System.out.println(files);
            if (files == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(files);
    }

	@GetMapping("/accessible")
	public ResponseEntity<List<FileEntity>> getAccessibleFiles(@AuthenticationPrincipal UserPrincipal principal) {
		List<FileEntity> files = fileService.listAccessibleFiles(principal.id());
		if (files == null) {
			return ResponseEntity.ok(Collections.emptyList());
		}
		return ResponseEntity.ok(files);
	}


    @PostMapping("/upload")
    public ResponseEntity<FileResponse> uploadFile(@Valid @ModelAttribute FileUploadRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        FileEntity uploadedFile = fileService.uploadFile(
                request.getFile(), 
                request.getParentDirId(), 
                userId
        );
        return ResponseEntity.ok(mapToResponse(uploadedFile));
    }

    @PostMapping("/profile-picture")
    public ResponseEntity<FileResponse> uploadProfilePicture(@Valid @ModelAttribute FileUploadRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        FileEntity uploadedFile = fileService.uploadProfilePicture(
                request.getFile(),
                userId
        );
        return ResponseEntity.ok(mapToResponse(uploadedFile));
    }

    @GetMapping("/profile-picture")
    public ResponseEntity<Resource> getProfilePicture(@AuthenticationPrincipal UserPrincipal principal) {
        try {
            UUID userId = principal.id();
            return downloadFile(userId);
        } catch (Exception e) { 
            // Catch whatever your fileService throws when a file is missing (e.g., FileNotFoundException)
            return ResponseEntity.notFound().build(); 
        }
    }

    @PostMapping("/create-folder")
    public ResponseEntity<FileResponse> createFolder(@Valid @RequestBody FolderCreateRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        FileEntity createdFolder = fileService.createFolder(request.getParentDirId(), currentUserId, request.getFolderName());
        return ResponseEntity.ok(mapToResponse(createdFolder));
    }


    @DeleteMapping("/delete/{uuid}") 
    @HasDeletePermission
    public ResponseEntity<String> deleteFile(@PathVariable UUID uuid) {
        try {
            fileService.deleteFile(uuid);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("File with id " + uuid + " not found!");
        }
        return ResponseEntity.ok("File with id " + uuid + " deleted successfully!");
    }

    @PatchMapping("/rename/{uuid}")
    @HasWritePermission
    public ResponseEntity<FileResponse> renameFile(
        @PathVariable UUID uuid, 
        @RequestBody RenameRequest request) {
        
        FileEntity updated = fileService.rename(uuid, request.getNewName());
        return ResponseEntity.ok(mapToResponse(updated));
    }

    @HasWritePermission
    @PatchMapping("/move/{uuid}")
    public ResponseEntity<FileResponse> moveFile(
        @PathVariable UUID uuid, 
        @RequestBody MoveRequest request) {
        
        FileEntity updated = fileService.move(uuid, request.getNewParentId());
        return ResponseEntity.ok(mapToResponse(updated));
    }

    @HasWritePermission
    @PutMapping("/replace/{uuid}")
    public ResponseEntity<FileResponse> replaceFile(
        @PathVariable UUID uuid, 
        @RequestParam("file") MultipartFile file) {
        
        FileEntity updated = fileService.replace(uuid, file);
        return ResponseEntity.ok(mapToResponse(updated));
    }

    @GetMapping("/search")
    public ResponseEntity<Boolean> searchInFile(@RequestParam String query) {
        // search logic
        return ResponseEntity.ok(true);
    }


    @GetMapping("/download/{uuid}")
    @HasReadPermission
    public ResponseEntity<Resource> downloadFile(@PathVariable UUID uuid) {
        FileEntity fileEntity = fileService.getFile(uuid);
        InputStream inputStream = fileService.downloadFile(uuid);
    
        InputStreamResource resource = new InputStreamResource(inputStream);

    return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileEntity.getName() + "\"")
            .contentType(MediaType.parseMediaType(fileEntity.getType()))
            .body(resource);
    }

    private FileResponse mapToResponse(FileEntity file) {
        return FileResponse.builder()
                .id(file.getId())
                .name(file.getName())
                .type(file.getType())
                .size(file.getSize())
                .parentId(file.getParentId())
                .ownerId(file.getOwnerId())
                .build();
    }

}
