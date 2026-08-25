package com.livehorizon.backend.repository;

import com.livehorizon.backend.model.Meeting;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MeetingRepository extends MongoRepository<Meeting, String> {
    List<Meeting> findByUserId(String userId); 
}
