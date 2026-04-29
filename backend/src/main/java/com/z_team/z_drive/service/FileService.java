package com.z_team.z_drive.service;

import com.z_team.z_drive.entity.FileEntity;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

public interface FileService {

        FileEntity uploadFile(MultipartFile file, UUID parentDirId, UUID userId);
    
        void deleteFile(UUID fileId);
    
        FileEntity getFile(UUID fileId);

        FileEntity replace(UUID uuid, MultipartFile file);

        FileEntity rename(UUID uuid, String newName);

        FileEntity move(UUID uuid, UUID newParentId);

        FileEntity createFolder(UUID parentDirId, UUID userId, String folderName);

        List<FileEntity> listOwnedFiles(UUID userId);

        List<FileEntity> listAccessibleFiles(UUID userId);

        InputStream downloadFile(UUID fileId);

}
