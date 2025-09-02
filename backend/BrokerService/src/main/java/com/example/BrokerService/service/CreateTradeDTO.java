package com.example.BrokerService.service;

import com.example.BrokerService.model.DeliveryType;
import com.example.BrokerService.model.Direction;
import com.example.BrokerService.model.Status;
import com.example.BrokerService.model.Unit;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateTradeDTO {
    private UUID accountId;
    private UUID instrumentId;
    private Direction direction;
    private Integer quantity;
    private Double price;
    private Unit unit;
    private DeliveryType deliveryType;
    private Status status;
    private UUID matchedTradeId;
}
