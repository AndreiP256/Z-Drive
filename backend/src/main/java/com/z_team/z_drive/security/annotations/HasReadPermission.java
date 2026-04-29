package com.z_team.z_drive.security.annotations;

import org.springframework.security.access.prepost.PreAuthorize;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("@fileSecurity.canAccess(#uuid, authentication.principal.id, 'READ')")
public @interface HasReadPermission {
}