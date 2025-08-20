package com.example.BrokerService.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Document(collection = "trades")
public class Trade {
    @Id
    private UUID id;
    private UUID accountId;
    private UUID instrumentId;
    private Direction direction;
    private Integer quantity;
    private Double price;
    private Unit unit;
    private DeliveryType deliveryType;
    private Status status;

}
