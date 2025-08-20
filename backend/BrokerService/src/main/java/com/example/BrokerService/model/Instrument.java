package com.example.BrokerService.model;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Document(collection = "accounts")
public class Instrument {
    @Id
    private UUID id;
    private String code;
    private LocalDate maturityDate;
}
