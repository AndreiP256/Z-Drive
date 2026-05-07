package com.z_team.z_drive.service.impl;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.List;

import com.z_team.z_drive.entity.FileEntity;
import com.z_team.z_drive.repository.FileRepository;
import com.z_team.z_drive.service.FileService;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.auth.signer.AwsS3V4Signer;
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.core.client.config.SdkAdvancedClientOption;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class FileServiceImpl implements FileService {

    private final FileRepository fileRepository;
    private final String bucketName;
    private final S3Client s3Client;

    @Autowired
    public FileServiceImpl(FileRepository fileRepository, 
                           @Value("${z-drive.storage.endpoint}") String endpoint,
                           @Value("${z-drive.storage.access-key}") String accessKey,
                           @Value("${z-drive.storage.secret-key}") String secretKey,
                           @Value("${z-drive.storage.bucket-name}") String bucketName) {

        this.fileRepository = fileRepository;
        this.bucketName = bucketName;
        
        this.s3Client = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .region(Region.EU_CENTRAL_1)
                .forcePathStyle(true)
                .overrideConfiguration(ClientOverrideConfiguration.builder()
                    .putAdvancedOption(SdkAdvancedClientOption.SIGNER, AwsS3V4Signer.create())
                    .build())
                .build();

        try {
            HeadBucketRequest headBucketRequest = HeadBucketRequest.builder()
                    .bucket(bucketName)
                    .build();
            s3Client.headBucket(headBucketRequest);
        } catch (NoSuchBucketException e) {
            s3Client.createBucket(CreateBucketRequest.builder()
                    .bucket(bucketName)
                    .build());
            System.out.println("Created missing bucket: " + bucketName);
        }
    }

    @Override
    @Transactional
    public FileEntity uploadFile(MultipartFile file, UUID parentDirId, UUID userId) {
        UUID fileId = UUID.randomUUID();
        String storageKey = fileId.toString();

        try {
            s3Client.putObject(PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageKey)
                    .contentType(file.getContentType())
                    .build(), 
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            FileEntity entity = new FileEntity();
            entity.setId(fileId);
            entity.setName(file.getOriginalFilename());
            entity.setSize((float) file.getSize());
            entity.setType(file.getContentType());
            entity.setFileLocation(storageKey); // Link to the S3 object
            entity.setOwnerId(userId);
            entity.setParentId(parentDirId);
            entity.setIsFolder(false);

            return fileRepository.save(entity);

        } catch (IOException e) {
            throw new RuntimeException("Storage System Unreachable", e);
        }
    }

    @Override
    public FileEntity getFile(UUID fileId) {
        return fileRepository.findById(fileId)
            .orElseThrow(() -> new RuntimeException("File not found"));
    }


    @Override
    public void deleteFile(UUID fileId) {
        boolean isFolder = fileRepository.findById(fileId)
            .orElseThrow(() -> new RuntimeException("File not found"))
            .getIsFolder();
        fileRepository.deleteById(fileId);

        if (isFolder) return; 

        try {
            s3Client.deleteObject(request -> 
            request
                .bucket(bucketName)
                .key(fileId.toString()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file from storage", e);
        }
    }

    @Override
    public List<FileEntity> listOwnedFiles(UUID userId) {
        return fileRepository.findByOwnerId(userId);
    }

    @Override
    public List<FileEntity> listAccessibleFiles(UUID userId) {
        // This needs to be changed
        return fileRepository.findByOwnerId(userId);
    }

    @Override
    @Transactional
    public FileEntity replace(UUID uuid, MultipartFile file) {
        FileEntity fileEntity = fileRepository.findById(uuid)
            .orElseThrow(() -> new RuntimeException("File not found"));

        try {
            s3Client.putObject(PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileEntity.getId().toString())
                    .contentType(file.getContentType())
                    .build(), 
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            fileEntity.setSize((float) file.getSize());
            fileEntity.setName(file.getOriginalFilename());
            fileEntity.setType(file.getContentType());
            return fileEntity; 
        } catch (IOException e) {
            throw new RuntimeException("Replacement failed", e);
        }
    }

    @Override
    @Transactional
    public FileEntity rename(UUID uuid, String newName) {
        FileEntity file = fileRepository.findById(uuid)
            .orElseThrow(() -> new RuntimeException("File not found"));
        file.setName(newName);
        return file;
    }

    @Override
    @Transactional
    public FileEntity move(UUID uuid, UUID newParentId) {
        FileEntity file = fileRepository.findById(uuid)
            .orElseThrow(() -> new RuntimeException("File not found"));
        file.setParentId(newParentId);
        return file;
    }

    @Override
    public FileEntity createFolder(UUID parentDirId, UUID userId, String folderName) {
        FileEntity folder = new FileEntity();
        folder.setId(UUID.randomUUID());
        folder.setName(folderName);
        folder.setSize(0f);
        folder.setType("folder");
        folder.setFileLocation(null);
        folder.setOwnerId(userId);
        folder.setParentId(parentDirId);
        folder.setIsFolder(true);
        return fileRepository.save(folder);
    }


    @Override
    public InputStream downloadFile(UUID fileId) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        return s3Client.getObject(req -> req
                .bucket(bucketName)
                .key(file.getFileLocation()), 
                ResponseTransformer.toInputStream());
    }
}
