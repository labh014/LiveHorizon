package com.livehorizon.storage;

import java.io.IOException;
import java.util.Locale;

import com.livehorizon.common.ApiException;
import com.livehorizon.config.AppProperties;
import com.livehorizon.user.User;
import com.livehorizon.user.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/** Validates the upload, then hands the bytes to whichever storage is wired. */
@Service
public class AvatarService {

    private final AvatarStorage storage;
    private final UserService userService;
    private final AppProperties.Storage properties;

    public AvatarService(AvatarStorage storage, UserService userService, AppProperties appProperties) {
        this.storage = storage;
        this.userService = userService;
        this.properties = appProperties.storage();
    }

    public String upload(User user, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No file uploaded");
        }

        String contentType = normalize(file.getContentType());
        if (!properties.allowedContentTypes().contains(contentType)) {
            throw new ApiException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only PNG and JPG/JPEG are allowed");
        }

        long maxBytes = properties.maxSize().toBytes();
        if (file.getSize() > maxBytes) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE,
                    "File too large (max %dMB)".formatted(properties.maxSize().toMegabytes()));
        }

        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Upload failed", ex);
        }

        String url = storage.store(user, content, contentType, user.getAvatarUrl());
        user.setAvatarUrl(url);
        userService.save(user);
        return url;
    }

    private String normalize(String contentType) {
        if (contentType == null) {
            return "";
        }
        int separator = contentType.indexOf(';');
        String base = separator >= 0 ? contentType.substring(0, separator) : contentType;
        return base.trim().toLowerCase(Locale.ROOT);
    }
}
