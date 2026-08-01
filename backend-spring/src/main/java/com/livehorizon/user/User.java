package com.livehorizon.user;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * Maps onto the collection the Node/Mongoose backend already writes, so an
 * existing database keeps working unchanged (bcrypt hashes included).
 */
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Field("name")
    private String name;

    @Indexed(unique = true)
    @Field("username")
    private String username;

    @Field("password")
    private String password;

    @Indexed(sparse = true)
    @Field("token")
    private String token;

    @Field("tokenExpiry")
    private Instant tokenExpiry;

    @Field("avatarUrl")
    private String avatarUrl = "";

    protected User() {
    }

    public User(String name, String username, String password) {
        this.name = name;
        this.username = username;
        this.password = password;
        this.avatarUrl = "";
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Instant getTokenExpiry() {
        return tokenExpiry;
    }

    public void setTokenExpiry(Instant tokenExpiry) {
        this.tokenExpiry = tokenExpiry;
    }

    public String getAvatarUrl() {
        return avatarUrl == null ? "" : avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public void clearSession() {
        this.token = null;
        this.tokenExpiry = null;
    }

    public boolean isSessionExpired(Instant now) {
        return tokenExpiry == null || now.isAfter(tokenExpiry);
    }
}
