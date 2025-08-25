package com.example.BrokerService.service;

import com.example.BrokerService.model.Direction;
import com.example.BrokerService.model.Trade;
import com.example.protobuf.BalanceProto;
import com.example.protobuf.OTEProto;
import com.example.protobuf.TradeProto;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KafkaService {

    private final KafkaTemplate<String, byte[]> kafkaTemplate;
    private final AccountStatusService accountStatusService;

    public void sendDailyBalanceRequest(List<Trade> trades, LocalDate date) {
        BalanceProto.DailyBalanceRequest.Builder requestBuilder = BalanceProto.DailyBalanceRequest.newBuilder();
        requestBuilder.setDate(date.toString());

        for (Trade trade : trades) {
            TradeProto.TradeEvent tradeEvent = TradeProto.TradeEvent.newBuilder()
                    .setTradeId(trade.getId().toString())
                    .setInstrumentId(String.valueOf(trade.getInstrumentId()))
                    .setAccountId(trade.getAccountId().toString())
                    .setDirection(trade.getDirection() == Direction.BUY ? TradeProto.Direction.BUY : TradeProto.Direction.SELL)
                    .setQuantity(trade.getQuantity())
                    .setPrice(trade.getPrice())
                    .setUnit(trade.getUnit().name())
                    .setDeliveryType(trade.getDeliveryType().name())
                    .setStatus(trade.getStatus().name())
                    .build();

            requestBuilder.addTrades(tradeEvent);
        }

        kafkaTemplate.send("TradeEvents", UUID.randomUUID().toString(), requestBuilder.build().toByteArray());
    }

    @KafkaListener(topics = "BalanceEventsAck", groupId = "BrokerGroup")
    public void handleOTEUpdate(byte[] responseByte) throws Exception {
        var response = OTEProto.OTEUpdateResponse.parseFrom(responseByte);
        LocalDate date = LocalDate.parse(response.getDate());
        for (OTEProto.OTEUpdate oteUpdate : response.getAccountOteList()) {
            UUID accountId = UUID.fromString(oteUpdate.getAccountId());
            BigDecimal ote = BigDecimal.valueOf(oteUpdate.getOte());
            accountStatusService.updateOTE(accountId, date, ote);
        }
    }
}
