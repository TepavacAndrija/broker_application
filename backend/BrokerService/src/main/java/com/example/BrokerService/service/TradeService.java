package com.example.BrokerService.service;

import com.example.BrokerService.model.*;
import com.example.BrokerService.repository.InstrumentRepository;
import com.example.BrokerService.repository.TradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TradeService {
    private final TradeRepository tradeRepository;
    private final InstrumentRepository instrumentRepository;
    private final KafkaService kafkaService;

    public Trade createTrade(CreateTradeDTO tradeDTO) {
        Trade trade = new Trade();
        trade.setId(UUID.randomUUID());
        trade.setInstrumentId(tradeDTO.getInstrumentId());
        trade.setAccountId(tradeDTO.getAccountId());
        trade.setPrice(tradeDTO.getPrice());
        trade.setQuantity(tradeDTO.getQuantity());
        trade.setDirection(tradeDTO.getDirection());
        trade.setDeliveryType(tradeDTO.getDeliveryType());
        trade.setUnit(tradeDTO.getUnit());
        trade.setStatus(tradeDTO.getStatus());
        trade.setMatchedTradeId(tradeDTO.getMatchedTradeId());
        return tradeRepository.save(trade);
    }

    public Trade updateTrade(UUID id, CreateTradeDTO createTradeDTO) {
        Trade trade = tradeRepository.findById(id).
                orElseThrow(() -> new DataRetrievalFailureException(String.format("Trade with id %s not found", id)));

        trade.setInstrumentId(createTradeDTO.getInstrumentId());
        trade.setAccountId(createTradeDTO.getAccountId());
        trade.setPrice(createTradeDTO.getPrice());
        trade.setQuantity(createTradeDTO.getQuantity());
        trade.setDirection(createTradeDTO.getDirection());
        trade.setDeliveryType(createTradeDTO.getDeliveryType());
        trade.setUnit(createTradeDTO.getUnit());
        trade.setMatchedTradeId(createTradeDTO.getMatchedTradeId());
        trade.setStatus(createTradeDTO.getStatus());
        return tradeRepository.save(trade);
    }

    public List<Trade> getAllTrades() {
        return tradeRepository.findAll();
    }

    public Optional<Trade> getTradeById(UUID tradeId) {
        return tradeRepository.findById(tradeId);
    }

    public List<Trade> getAllTradesByAccountId(UUID accountId) {
        return tradeRepository.findByAccountId(accountId);
    }

    public List<Trade> getAllTradesByInstrumentId(UUID instrumentId) {
        return tradeRepository.findByInstrumentId(instrumentId);
    }

    public void exerciseTrade(UUID tradeId, LocalDate currentDate) {
        Trade trade = tradeRepository.findById(tradeId)
                .orElseThrow(() -> new DataRetrievalFailureException("Trade not found, tradeId="+tradeId));
        if(trade.getStatus()!= Status.MATCHED){
            throw new IllegalStateException("Trade status is NOT MATCHED, tradeId="+tradeId);
        }

        Instrument instrument = instrumentRepository.findById(trade.getInstrumentId())
                .orElseThrow(() -> new DataRetrievalFailureException("Instrument not found, tradeId="+tradeId));

        if(currentDate.isAfter(instrument.getMaturityDate())){
            throw new IllegalStateException("Instrument maturity date is after current date, tradeId="+tradeId);
        }

        trade.setStatus(Status.EXERCISED);
        trade.setMatchedTradeId(null);
        tradeRepository.save(trade);
    }

    public void openTrade(UUID tradeId, LocalDate currentDate) {
        Trade trade = tradeRepository.findById(tradeId)
                .orElseThrow(() -> new DataRetrievalFailureException("Trade not found, tradeId="+tradeId));
//        if(trade.getStatus()!= Status.MATCHED){
//            throw new IllegalStateException("Trade status is NOT MATCHED, tradeId="+tradeId);
//        }

        Instrument instrument = instrumentRepository.findById(trade.getInstrumentId())
                .orElseThrow(() -> new DataRetrievalFailureException("Instrument not found, tradeId="+tradeId));

        if(currentDate.isAfter(instrument.getMaturityDate())){
            throw new IllegalStateException("Instrument maturity date is after current date, tradeId="+tradeId);
        }

        trade.setStatus(Status.OPEN);
        trade.setMatchedTradeId(null);
        tradeRepository.save(trade);
    }


    public void matchTrade(UUID tradeId, LocalDate currentDate) {
        Trade trade = tradeRepository.findById(tradeId)
                .orElseThrow(() -> new DataRetrievalFailureException("Trade not found, tradeId="+tradeId));
        if(trade.getStatus()!= Status.OPEN){
            throw new IllegalStateException("Trade status is NOT OPEN, tradeId="+tradeId);
        }

        Instrument instrument = instrumentRepository.findById(trade.getInstrumentId())
                .orElseThrow(() -> new DataRetrievalFailureException("Instrument not found, tradeId="+tradeId));

        if(currentDate.isAfter(instrument.getMaturityDate())){
            throw new IllegalStateException("Instrument maturity date is after current date, tradeId="+tradeId);
        }

        trade.setStatus(Status.MATCHED);
        tradeRepository.save(trade);
    }

    public void closeExpiredTrades(LocalDate currentDate) {
        List<Trade> expiredTrades = tradeRepository.findExpiredTrades(currentDate);
        expiredTrades.forEach(trade -> {
            trade.setStatus(Status.CLOSED);
        });
        tradeRepository.saveAll(expiredTrades);
    }

    public List<Trade> getOpenTrades(){
        return tradeRepository.findByStatus(Status.OPEN);
    }

    @Scheduled(cron = "0 0 17 * * ?")
    //@Scheduled(fixedDelay = 3000)
    public void triggerDailyBalanceCalculation() {
        System.out.println("Pokrećem dnevnu kalkulaciju...");
        List<Trade> openTrades = tradeRepository.findByStatus(Status.OPEN);
        LocalDate currentDate = LocalDate.now();

        if(!openTrades.isEmpty()){
            kafkaService.sendDailyBalanceRequest(openTrades, currentDate);
        }

        closeExpiredTrades(currentDate);
    }

    public void deleteTrade(UUID id) {
        if (!tradeRepository.existsById(id)) {
            throw new DataRetrievalFailureException("Trade not found with id: " + id);
        }
        tradeRepository.deleteById(id);
    }

    public List<Trade> findMatchableTrades(UUID instrumentId, Direction direction, double price, int quantity, Unit unit, DeliveryType deliveryType) {
        Direction opposite = (direction == Direction.BUY) ? Direction.SELL : Direction.BUY;

        return tradeRepository.findByInstrumentIdAndStatusAndDirectionAndPriceAndQuantityAndUnitAndDeliveryType(instrumentId,Status.OPEN, opposite,price,quantity, unit, deliveryType);
    }
}
