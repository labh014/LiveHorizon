package com.livehorizon.storage;

import java.util.Map;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.livehorizon.common.ApiException;
import com.livehorizon.config.AppProperties;
import com.livehorizon.user.User;

import org.springframework.http.HttpStatus;

public class CloudinaryAvatarStorage implements AvatarStorage {

    private final Cloudinary cloudinary;
    private final String folder;

    public CloudinaryAvatarStorage(AppProperties.Cloudinary properties) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", properties.cloudName(),
                "api_key", properties.apiKey(),
                "api_secret", properties.apiSecret(),
                "secure", true));
        this.folder = properties.folder();
    }

    @Override
    public String store(User user, byte[] content, String contentType, String previousUrl) {
        try {
            // A stable public_id makes `overwrite` meaningful: each user keeps one
            // asset instead of accumulating a new one per upload.
            Map<?, ?> result = cloudinary.uploader().upload(content, ObjectUtils.asMap(
                    "folder", folder,
                    "public_id", AvatarNaming.safeUsername(user.getUsername()),
                    "resource_type", "image",
                    "overwrite", true,
                    "invalidate", true));

            Object secureUrl = result.get("secure_url");
            if (secureUrl == null) {
                throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload avatar");
            }
            return secureUrl.toString();
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload avatar", ex);
        }
    }
}
