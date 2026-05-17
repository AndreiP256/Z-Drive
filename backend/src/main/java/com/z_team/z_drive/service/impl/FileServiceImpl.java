package com.z_team.z_drive.service.impl;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;

import com.z_team.z_drive.entity.FileEntity;
import com.z_team.z_drive.repository.FileRepository;
import com.z_team.z_drive.repository.RolePermissionsRepository;
import com.z_team.z_drive.repository.SharedWithUserRepository;
import com.z_team.z_drive.repository.UsersWithFileRolesRepository;
import com.z_team.z_drive.service.FileService;
import com.z_team.z_drive.service.LogService;
import com.z_team.z_drive.security.SecurityUtils;

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
    private final LogService logService;
    private final SharedWithUserRepository sharedWithUserRepository;
    private final UsersWithFileRolesRepository usersWithFileRolesRepository;
    private final RolePermissionsRepository rolePermissionsRepository;
    private final String bucketName;
    private final S3Client s3Client;

    @Autowired
    public FileServiceImpl(FileRepository fileRepository,
                           LogService logService,
                           SharedWithUserRepository sharedWithUserRepository,
                           UsersWithFileRolesRepository usersWithFileRolesRepository,
                           RolePermissionsRepository rolePermissionsRepository,
                           @Value("${z-drive.storage.endpoint}") String endpoint,
                           @Value("${z-drive.storage.access-key}") String accessKey,
                           @Value("${z-drive.storage.secret-key}") String secretKey,
                           @Value("${z-drive.storage.bucket-name}") String bucketName) {

        this.fileRepository = fileRepository;
        this.logService = logService;
        this.sharedWithUserRepository = sharedWithUserRepository;
        this.usersWithFileRolesRepository = usersWithFileRolesRepository;
        this.rolePermissionsRepository = rolePermissionsRepository;
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
            entity.setFileLocation(storageKey);
            entity.setOwnerId(userId);
            entity.setParentId(parentDirId);
            entity.setIsFolder(false);

            FileEntity saved = fileRepository.save(entity);

            logService.logAction(
                    userId,
                    "UPLOAD",
                    fileId,
                    String.format("Uploaded file: %s (%.2f KB)", file.getOriginalFilename(), file.getSize() / 1024.0)
            );

            return saved;

        } catch (IOException e) {
            logService.logAction(
                    userId,
                    "UPLOAD",
                    fileId,
                    String.format("Failed to upload file: %s - Error: %s", file.getOriginalFilename(), e.getMessage()),
                    "FAILED"
            );
            throw new RuntimeException("Storage System Unreachable", e);
        }
    }

    @Override
    public FileEntity getFile(UUID fileId) {
        return fileRepository.findById(fileId)
            .orElseThrow(() -> new RuntimeException("File not found"));
    }

    @Override
    @Transactional
    public void deleteFile(UUID fileId) {
        FileEntity fileEntity = fileRepository.findById(fileId)
            .orElseThrow(() -> new RuntimeException("File not found"));

        UUID userId = SecurityUtils.getCurrentUserId();
        String fileName = fileEntity.getName();
        boolean isFolder = fileEntity.getIsFolder();

        fileRepository.deleteById(fileId);

        if (!isFolder) {
            try {
                s3Client.deleteObject(request ->
                    request.bucket(bucketName).key(fileId.toString()));
            } catch (Exception e) {
                logService.logAction(
                        userId,
                        "DELETE",
                        fileId,
                        String.format("Failed to delete file from storage: %s - Error: %s", fileName, e.getMessage()),
                        "FAILED"
                );
                throw new RuntimeException("Failed to delete file from storage", e);
            }
        }

        logService.logAction(
                userId,
                "DELETE",
                fileId,
                String.format("Deleted %s: %s", isFolder ? "folder" : "file", fileName)
        );
    }

    @Override
    public List<FileEntity> listOwnedFiles(UUID userId) {
        return fileRepository.findByOwnerId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileEntity> listAccessibleFiles(UUID userId) {
        if (isCurrentUserAdminOrManager()) {
            return fileRepository.findAll();
        }

        Set<UUID> fileIds = new LinkedHashSet<>();

        fileRepository.findByOwnerId(userId)
                .forEach(file -> fileIds.add(file.getId()));

        sharedWithUserRepository.findByUser_Id(userId)
                .forEach(sharedWithUser -> fileIds.add(sharedWithUser.getShared().getFileId()));

        usersWithFileRolesRepository.findByUser_Id(userId)
                .stream()
                .map(assignment -> assignment.getFileRole().getId())
                .flatMap(roleId -> rolePermissionsRepository.findByFileRole_Id(roleId).stream())
                .forEach(rolePermission -> fileIds.add(rolePermission.getFileId()));

        return fileIds.stream()
                .map(fileRepository::findById)
                .flatMap(Optional::stream)
                .toList();
    }

    @Override
    @Transactional
    public FileEntity replace(UUID uuid, MultipartFile file) {
        FileEntity fileEntity = fileRepository.findById(uuid)
            .orElseThrow(() -> new RuntimeException("File not found"));

        UUID userId = SecurityUtils.getCurrentUserId();
        String oldName = fileEntity.getName();

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

            FileEntity saved = fileRepository.save(fileEntity);

            logService.logAction(
                    userId,
                    "REPLACE",
                    uuid,
                    String.format("Replaced file %s with %s (%.2f KB)", oldName, file.getOriginalFilename(), file.getSize() / 1024.0)
            );

            return saved;
        } catch (IOException e) {
            logService.logAction(
                    userId,
                    "REPLACE",
                    uuid,
                    String.format("Failed to replace file: %s - Error: %s", oldName, e.getMessage()),
                    "FAILED"
            );
            throw new RuntimeException("Replacement failed", e);
        }
    }

    @Override
    @Transactional
    public FileEntity rename(UUID uuid, String newName) {
        FileEntity file = fileRepository.findById(uuid)
            .orElseThrow(() -> new RuntimeException("File not found"));

        UUID userId = SecurityUtils.getCurrentUserId();
        String oldName = file.getName();

        file.setName(newName);
        FileEntity saved = fileRepository.save(file);

        logService.logAction(
                userId,
                "RENAME",
                uuid,
                String.format("Renamed file from '%s' to '%s'", oldName, newName)
        );

        return saved;
    }

    @Override
    @Transactional
    public FileEntity move(UUID uuid, UUID newParentId) {
        FileEntity file = fileRepository.findById(uuid)
            .orElseThrow(() -> new RuntimeException("File not found"));

        UUID userId = SecurityUtils.getCurrentUserId();
        UUID oldParentId = file.getParentId();

        file.setParentId(newParentId);
        FileEntity saved = fileRepository.save(file);

        logService.logAction(
                userId,
                "MOVE",
                uuid,
                String.format("Moved file '%s' from parent %s to parent %s", file.getName(), oldParentId, newParentId)
        );

        return saved;
    }

    @Override
    @Transactional
    public FileEntity createFolder(UUID parentDirId, UUID userId, String folderName) {
        FileEntity folder = new FileEntity();
        UUID folderId = UUID.randomUUID();
        folder.setId(folderId);
        folder.setName(folderName);
        folder.setSize(0f);
        folder.setType("folder");
        folder.setFileLocation(null);
        folder.setOwnerId(userId);
        folder.setParentId(parentDirId);
        folder.setIsFolder(true);

        FileEntity saved = fileRepository.save(folder);

        logService.logAction(
                userId,
                "CREATE_FOLDER",
                folderId,
                String.format("Created folder: %s", folderName)
        );

        return saved;
    }

    @Override
    public InputStream downloadFile(UUID fileId) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        try {
            InputStream stream = s3Client.getObject(req -> req
                    .bucket(bucketName)
                    .key(file.getFileLocation()),
                    ResponseTransformer.toInputStream());

            UUID userId = SecurityUtils.getCurrentUserId();
            logService.logAction(
                    userId,
                    "DOWNLOAD",
                    fileId,
                    String.format("Downloaded file: %s (%.2f KB)", file.getName(), file.getSize() / 1024.0)
            );

            return stream;
        } catch (Exception e) {
            UUID userId = SecurityUtils.getCurrentUserId();
            logService.logAction(
                    userId,
                    "DOWNLOAD",
                    fileId,
                    String.format("Failed to download file: %s - Error: %s", file.getName(), e.getMessage()),
                    "FAILED"
            );
            throw new RuntimeException("File download failed", e);
        }
    }

    private boolean isCurrentUserAdminOrManager() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities().stream().anyMatch(authority ->
                authority.getAuthority().equals("ROLE_ADMIN") ||
                authority.getAuthority().equals("ROLE_MANAGER")
        );
    }
}