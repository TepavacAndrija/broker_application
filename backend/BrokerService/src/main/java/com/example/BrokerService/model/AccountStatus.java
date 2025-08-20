package com.example.BrokerService.model;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Document(collection = "accounts")
public class AccountStatus {
    @Id
    private UUID id;
    private UUID accountId;
    private LocalDate date;
    private BigDecimal ote;
}
