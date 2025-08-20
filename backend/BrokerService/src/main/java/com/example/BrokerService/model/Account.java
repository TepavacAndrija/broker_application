package com.example.BrokerService.model;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.UUID;

@Data
@Document(collection = "accounts")
public class Account {
    @Id
    private UUID id;
    private String name;
    private String userInfo;
}
