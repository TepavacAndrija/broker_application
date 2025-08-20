package com.example.BrokerService.service;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateAccountStatusDTO {
    private UUID accountId;
    private LocalDate date;
    private BigDecimal ote;
}
