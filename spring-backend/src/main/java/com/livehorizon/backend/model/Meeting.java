package com.livehorizon.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@Document(collection = "meetings")
public class Meeting {
    @Id
    private String id;
    
    private String userId; 
    private String meetingCode;
    private Date date = new Date();
}
