package com.livehorizon.storage;

final class AvatarNaming {

    private AvatarNaming() {
    }

    /**
     * The Node version interpolated the raw username into the filename, which
     * let a username containing path separators escape the upload directory.
     */
    static String safeUsername(String username) {
        // Dots are excluded along with separators: the extension is appended
        // separately, so nothing in the username half needs one.
        String cleaned = username == null ? "" : username.replaceAll("[^a-zA-Z0-9_-]", "_");
        if (cleaned.isBlank()) {
            return "user";
        }
        return cleaned.length() > 40 ? cleaned.substring(0, 40) : cleaned;
    }

    /** Derived from the validated content type, never from the client's filename. */
    static String extensionFor(String contentType) {
        return "image/png".equalsIgnoreCase(contentType) ? "png" : "jpg";
    }
}
