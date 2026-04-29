package com.z_team.z_drive.service.impl;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

import com.z_team.z_drive.entity.FileEntity;
import com.z_team.z_drive.repository.FileRepository;
import com.z_team.z_drive.service.FileService;

@Service
public class FileServiceImpl implements FileService {

    private final FileRepository fileRepository;
    private final Path rootLocation;

    @Autowired
    public FileServiceImpl(FileRepository fileRepository, 
                           @Value("${z-drive.storage.location}") String storageLocation) {
        this.fileRepository = fileRepository;
        this.rootLocation = Paths.get(storageLocation);
    }

    @Override
    public FileEntity uploadFile(MultipartFile file, UUID parentDirId, UUID userId) {
        String filename = file.getOriginalFilename();
        Path destinationFile = this.rootLocation.resolve(Paths.get(filename)).normalize().toAbsolutePath();

        // TO DO handle folder logic, and change the path
        try {
            // Check if directory exists, if not, create it
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }

            Files.copy(file.getInputStream(),  destinationFile, StandardCopyOption.REPLACE_EXISTING);
            
        } catch (IOException e) {
            throw new RuntimeException("Could not store file. Error: " + e.getMessage());
        }

        FileEntity entity = new FileEntity();
        entity.setName(file.getOriginalFilename());
        entity.setSize((float) file.getSize());
        entity.setType(file.getContentType());
        entity.setFileLocation(destinationFile.toString());
        entity.setParent(parentDirId);
        entity.setIsFolder(false);
        entity.setOwnerId(userId);

        return fileRepository.save(entity);
    }

    @Override
    public FileEntity getFile(UUID fileId) {
        // TODO Auto-generated method stub
        return null;
    }


    @Override
    public void deleteFile(UUID fileId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'deleteFile'");
    }

    @Override
    public List<FileEntity> listFiles() {
        // TODO Auto-generated method stub
        return null;
    }

}
