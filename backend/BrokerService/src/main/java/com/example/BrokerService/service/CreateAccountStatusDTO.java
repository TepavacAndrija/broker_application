package com.example.BrokerService.service;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CreateAccountStatusDTO {
    private UUID accountId;
    private LocalDateTime date;
    private BigDecimal ote;
}
