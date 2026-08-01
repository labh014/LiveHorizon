package com.livehorizon.meeting.dto;

import java.time.Instant;

import com.livehorizon.meeting.Meeting;

import jakarta.validation.constraints.NotBlank;

import com.fasterxml.jackson.annotation.JsonProperty;

public final class MeetingDtos {

    private MeetingDtos() {
    }

    /** The frontend posts {"meeting_code": "..."}. */
    public record AddHistoryRequest(
            @JsonProperty("meeting_code")
            @NotBlank(message = "Meeting code is required")
            String meetingCode) {
    }

    public record MeetingView(String id, String meetingCode, Instant date) {

        public static MeetingView of(Meeting meeting) {
            return new MeetingView(meeting.getId(), meeting.getMeetingCode(), meeting.getDate());
        }
    }
}
