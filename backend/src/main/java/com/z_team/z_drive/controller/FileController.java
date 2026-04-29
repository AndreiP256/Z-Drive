package com.z_team.z_drive.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.z_team.z_drive.dto.files.FileResponse;
import com.z_team.z_drive.dto.files.FileUploadRequest;
import com.z_team.z_drive.dto.user.UserResponse;
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
    @PostMapping(value = "/upload")
    public ResponseEntity<FileResponse> uploadFile(@Valid @ModelAttribute FileUploadRequest request) {
        FileEntity uploadedFile = fileService.uploadFile(
                request.getFile(), 
                request.getParentDirId(), 
                request.getUserId()
        );
        return ResponseEntity.ok(mapToResponse(uploadedFile));
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
    public ResponseEntity<String> deleteFile(@PathVariable("uuid") String uuid) {
        return ResponseEntity.ok("File with id " + uuid + " deleted successfully!");
    }

    // TO DO CHANGE THIS, its not a file type variable
    @PutMapping("/update/{uuid}")
    public ResponseEntity<String> updateFile(@PathVariable("uuid") String uuid, @RequestBody File newName) {
        return ResponseEntity.ok("File with id " + uuid + " updated successfully to " + "!");
    }

    @GetMapping("/search")
    public ResponseEntity<Boolean> searchInFile(@RequestParam String query) {
        // search logic
        return ResponseEntity.ok(true);
    }

    @PatchMapping("/{fileId}/permissions")
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
