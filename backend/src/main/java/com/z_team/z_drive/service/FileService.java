package com.z_team.z_drive.service;

import com.z_team.z_drive.entity.FileEntity;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

public interface FileService {

        FileEntity uploadFile(MultipartFile file, UUID parentDirId, UUID userId);
    
        void deleteFile(UUID fileId);
    
        FileEntity getFile(UUID fileId);
    
        List<FileEntity> listFiles();
}
