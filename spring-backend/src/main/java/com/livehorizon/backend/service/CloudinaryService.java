package com.livehorizon.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired(required = false)
    private Cloudinary cloudinary;

    public boolean isConfigured() {
        return cloudinary != null;
    }

    public String uploadAvatar(MultipartFile file, String username) {
        if (!isConfigured()) {
            return null;
        }
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "livehorizon/avatars",
                    "resource_type", "image",
                    "overwrite", true,
                    "public_id", username + "_" + System.currentTimeMillis()
            ));
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage(), e);
        }
    }
}
