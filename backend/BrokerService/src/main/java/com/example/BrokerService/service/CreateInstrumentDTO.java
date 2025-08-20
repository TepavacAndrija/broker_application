package com.example.BrokerService.service;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateInstrumentDTO {
    String code;
    LocalDate maturityDate;
}
