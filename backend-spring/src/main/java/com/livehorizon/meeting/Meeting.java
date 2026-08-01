package com.livehorizon.meeting;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "meetings")
public class Meeting {

    @Id
    private String id;

    /** The owner's username, matching the Node schema. */
    @Indexed
    @Field("userId")
    private String userId;

    @Field("meetingCode")
    private String meetingCode;

    /**
     * Set per document. The Mongoose schema used `default: Date.now()`, which is
     * evaluated once at module load and stamped every meeting with the process
     * start time.
     */
    @Field("date")
    private Instant date;

    protected Meeting() {
    }

    public Meeting(String userId, String meetingCode, Instant date) {
        this.userId = userId;
        this.meetingCode = meetingCode;
        this.date = date;
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getMeetingCode() {
        return meetingCode;
    }

    public Instant getDate() {
        return date;
    }
}
