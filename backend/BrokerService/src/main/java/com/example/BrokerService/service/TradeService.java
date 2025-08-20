package com.example.BrokerService.service;

import com.example.BrokerService.model.Instrument;
import com.example.BrokerService.model.Status;
import com.example.BrokerService.model.Trade;
import com.example.BrokerService.repository.InstrumentRepository;
import com.example.BrokerService.repository.TradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TradeService {
    private final TradeRepository tradeRepository;
    private final InstrumentRepository instrumentRepository;

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
        if(trade.getStatus()!= Status.OPEN){
            throw new IllegalStateException("Trade status is NOT OPEN, tradeId="+tradeId);
        }

        Instrument instrument = instrumentRepository.findById(trade.getInstrumentId())
                .orElseThrow(() -> new DataRetrievalFailureException("Instrument not found, tradeId="+tradeId));

        if(currentDate.isAfter(instrument.getMaturityDate())){
            throw new IllegalStateException("Instrument maturity date is after current date, tradeId="+tradeId);
        }

        trade.setStatus(Status.EXERCISED);
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
}
