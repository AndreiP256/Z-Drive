package com.z_team.z_drive.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.z_team.z_drive.dto.files.FileResponse;
import com.z_team.z_drive.dto.files.FileUploadRequest;
import com.z_team.z_drive.dto.files.FolderCreateRequest;
import com.z_team.z_drive.dto.files.MoveRequest;
import com.z_team.z_drive.dto.files.RenameRequest;
import com.z_team.z_drive.entity.FileEntity;
import com.z_team.z_drive.service.FileService;

import jakarta.validation.Valid;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.UUID;


@RestController
@RequestMapping("/files")
public class FileController {

    private final FileService fileService;

    @Autowired
    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    //TO DO handle security i think
    @PostMapping("/upload")
    public ResponseEntity<FileResponse> uploadFile(@Valid @ModelAttribute FileUploadRequest request) {
        FileEntity uploadedFile = fileService.uploadFile(
                request.getFile(), 
                request.getParentDirId(), 
                request.getUserId()
        );
        return ResponseEntity.ok(mapToResponse(uploadedFile));
    }

    @PostMapping("/create-folder")
    public ResponseEntity<FileResponse> createFolder(@Valid @RequestBody FolderCreateRequest request) {
        FileEntity createdFolder = fileService.createFolder(request.getParentDirId(), request.getUserId(), request.getFolderName());
        return ResponseEntity.ok(mapToResponse(createdFolder));
    }

    // Getting list of filenames that have been uploaded
    @GetMapping
    public String[] getFiles()
    {
        String folderPath = System.getProperty("user.dir") +"/Uploads";
        File directory= new File(folderPath);
        
        String[] filenames = directory.list();

        return filenames;
        
    }

    @DeleteMapping("/delete/{uuid}") 
    public ResponseEntity<String> deleteFile(@PathVariable UUID uuid) {
        try {
            fileService.deleteFile(uuid);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("File with id " + uuid + " not found!");
        }
        return ResponseEntity.ok("File with id " + uuid + " deleted successfully!");
    }

    @PatchMapping("/{uuid}/rename")
    public ResponseEntity<FileResponse> renameFile(
        @PathVariable UUID uuid, 
        @RequestBody RenameRequest request) {
        
        FileEntity updated = fileService.rename(uuid, request.getNewName());
        return ResponseEntity.ok(mapToResponse(updated));
    }

    @PatchMapping("/{uuid}/move")
    public ResponseEntity<FileResponse> moveFile(
        @PathVariable UUID uuid, 
        @RequestBody MoveRequest request) {
        
        FileEntity updated = fileService.move(uuid, request.getNewParentId());
        return ResponseEntity.ok(mapToResponse(updated));
    }

    @PutMapping("/{uuid}/replace")
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

    @PatchMapping("/{uuid}/permissions")
    public ResponseEntity<File> changePermissions() {
        // change permissions logic
        return ResponseEntity.ok(new File("dummy"));

    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Hello world!");
    }
    
    // Downloading a file
    @GetMapping("/download/{path}")
    public ResponseEntity<String> downloadFile(@PathVariable("path") String filename) throws FileNotFoundException {
        // Checking whether the file requested for download exists or not
        return ResponseEntity.ok("File " + filename + " downloaded successfully!");
        
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
