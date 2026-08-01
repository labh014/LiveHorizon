package com.livehorizon.meeting;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface MeetingRepository extends MongoRepository<Meeting, String> {

    List<Meeting> findByUserIdOrderByDateDesc(String userId);
}
