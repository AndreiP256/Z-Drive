package com.z_team.z_drive.security;

import java.util.UUID;

public record UserPrincipal(UUID id, String email) {}