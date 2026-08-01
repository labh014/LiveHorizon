package com.livehorizon.storage;

import com.livehorizon.user.User;

/** Where an uploaded avatar ends up. Swapped at wiring time by {@code StorageConfig}. */
public interface AvatarStorage {

    /**
     * @param previousUrl the user's current avatar URL, so an implementation can
     *                    clean up what it replaces
     * @return the URL to store on the user document
     */
    String store(User user, byte[] content, String contentType, String previousUrl);
}
