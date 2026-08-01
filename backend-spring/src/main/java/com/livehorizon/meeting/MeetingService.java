package com.livehorizon.meeting;

import java.time.Clock;
import java.util.List;

import com.livehorizon.common.ApiException;
import com.livehorizon.user.User;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class MeetingService {

    private static final int MAX_CODE_LENGTH = 128;

    private final MeetingRepository meetingRepository;
    private final Clock clock;

    public MeetingService(MeetingRepository meetingRepository, Clock clock) {
        this.meetingRepository = meetingRepository;
        this.clock = clock;
    }

    public List<Meeting> history(User user) {
        return meetingRepository.findByUserIdOrderByDateDesc(user.getUsername());
    }

    public Meeting add(User user, String meetingCode) {
        String code = meetingCode == null ? "" : meetingCode.trim();
        if (code.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Meeting code is required");
        }
        if (code.length() > MAX_CODE_LENGTH) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Meeting code is too long");
        }
        return meetingRepository.save(new Meeting(user.getUsername(), code, clock.instant()));
    }
}
