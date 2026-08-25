package com.livehorizon.backend.service;

import com.livehorizon.backend.model.Meeting;
import com.livehorizon.backend.repository.MeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;

    @Autowired
    public MeetingService(MeetingRepository meetingRepository) {
        this.meetingRepository = meetingRepository;
    }

    public List<Meeting> getHistory(String username) {
        return meetingRepository.findByUserId(username);
    }

    public Meeting addHistory(String username, String meetingCode) {
        Meeting meeting = new Meeting();
        meeting.setUserId(username);
        meeting.setMeetingCode(meetingCode);
        meeting.setDate(new Date());
        return meetingRepository.save(meeting);
    }
}
