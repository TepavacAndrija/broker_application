package com.example.BrokerService.model;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Document(collection = "accountStatuses")
public class AccountStatus {
    @Id
    private UUID id;
    private UUID accountId;
    @Field("date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    private BigDecimal ote;
}
