package com.example.BrokerService.model;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.UUID;


@Data
@Document(collection="users")
public class User {
    @Id
    private UUID id;
    private String name;
    private Role role;
}
