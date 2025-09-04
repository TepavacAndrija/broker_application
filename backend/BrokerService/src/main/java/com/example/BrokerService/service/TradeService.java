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

        Trade savedTrade = tradeRepository.save(trade);

        if(Status.OPEN.equals(savedTrade.getStatus())){
            matchWithExistingTrade(savedTrade);
        }

        return savedTrade;
    }

    public void matchWithExistingTrade(Trade newTrade){
        Direction opposite = (newTrade.getDirection() == Direction.BUY)?Direction.SELL:Direction.BUY;

        System.out.println("Opposite: "+opposite + "instrument id: "+newTrade.getInstrumentId()
                +"price: "+newTrade.getPrice()+"quantity: "+newTrade.getQuantity()+"unit: "
                +newTrade.getUnit()+"deliveryType: "+newTrade.getDeliveryType());
        List<Trade> matches = tradeRepository.findByInstrumentIdAndStatusAndDirectionAndPriceAndQuantityAndUnitAndDeliveryType(
                newTrade.getInstrumentId(),Status.OPEN,opposite, newTrade.getPrice(),
                newTrade.getQuantity(),newTrade.getUnit(),newTrade.getDeliveryType());

        System.out.println("matches: " + matches);
        if (!matches.isEmpty()) {
            Trade existingTrade = matches.getFirst();
            matchTradePair(newTrade, existingTrade);
        }
        else  {
            System.out.println("No matching trade found");
        }

    }

    private void matchTradePair(Trade trade1, Trade trade2){
        trade1.setMatchedTradeId(trade2.getId());
        trade2.setMatchedTradeId(trade1.getId());

        trade1.setStatus(Status.MATCHED);
        trade2.setStatus(Status.MATCHED);

        tradeRepository.save(trade1);
        tradeRepository.save(trade2);

    }


    public Trade updateTrade(UUID id, CreateTradeDTO createTradeDTO) {
        Trade trade = tradeRepository.findById(id).
                orElseThrow(() -> new DataRetrievalFailureException(String.format("Trade with id %s not found", id)));

        if(trade.getMatchedTradeId() != null){
            unmatchTrade(trade);
            System.out.print("unmatch trade " + trade.getMatchedTradeId());
        }
        trade.setInstrumentId(createTradeDTO.getInstrumentId());
        trade.setAccountId(createTradeDTO.getAccountId());
        trade.setPrice(createTradeDTO.getPrice());
        trade.setQuantity(createTradeDTO.getQuantity());
        trade.setDirection(createTradeDTO.getDirection());
        trade.setDeliveryType(createTradeDTO.getDeliveryType());
        trade.setUnit(createTradeDTO.getUnit());
        trade.setMatchedTradeId(createTradeDTO.getMatchedTradeId());
        trade.setStatus(createTradeDTO.getStatus());

        Trade updatedTrade=tradeRepository.save(trade);

        if(Status.OPEN.equals(updatedTrade.getStatus())){
            matchWithExistingTrade(updatedTrade);
        }

        return updatedTrade;
    }


//    private void unmatchTrade(Trade trade){
//        if(trade.getMatchedTradeId() == null){
//            return;
//        }
//
//        trade.setStatus(Status.OPEN);
//        trade.setMatchedTradeId(null);
//
//        Optional<Trade> matchedTrade = tradeRepository.findById(trade.getMatchedTradeId());
//
//        if(matchedTrade.isPresent()){
//            Trade matchedTradeEdit = matchedTrade.get();
//            matchedTradeEdit.setStatus(Status.OPEN);
//            matchedTradeEdit.setMatchedTradeId(null);
//            tradeRepository.save(matchedTradeEdit);
//        }
//        tradeRepository.save(trade);
//
//    }


    private void unmatchTrade(Trade trade){
        if(trade.getMatchedTradeId() == null){
            return;
        }
        Trade matchedTrade = tradeRepository.findById(trade.getMatchedTradeId()).orElseThrow(() -> new DataRetrievalFailureException("Matched trade not found"));

        trade.setStatus(Status.OPEN);
        matchedTrade.setStatus(Status.OPEN);

        trade.setMatchedTradeId(null);
        matchedTrade.setMatchedTradeId(null);

        tradeRepository.save(trade);
        tradeRepository.save(matchedTrade);
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
        if(trade.getMatchedTradeId() == null){
            throw new IllegalStateException("Matched trade not found, tradeId="+tradeId);
        }

        Trade trade2 = tradeRepository.findById(trade.getMatchedTradeId())
                .orElseThrow(() -> new DataRetrievalFailureException("Trade2 not found, tradeId="+trade.getMatchedTradeId()));
        if(trade2.getStatus()!= Status.MATCHED){
            throw new IllegalStateException("Trade status is NOT MATCHED, tradeId="+trade.getMatchedTradeId());
        }

        trade.setStatus(Status.EXERCISED);
        trade.setMatchedTradeId(null);

        trade2.setStatus(Status.EXERCISED);
        trade2.setMatchedTradeId(null);

        tradeRepository.save(trade);
        tradeRepository.save(trade2);
    }


    public void closeExpiredTrades(LocalDate currentDate) {
        List<Trade> expiredTrades = tradeRepository.findExpiredTrades(currentDate);
        expiredTrades.forEach(trade -> {
            trade.setStatus(Status.CLOSED);
        });
        tradeRepository.saveAll(expiredTrades);
    }

    @Scheduled(cron = "0 0 17 * * ?")
//    @Scheduled(fixedDelay = 3000)
    public void triggerDailyBalanceCalculation() {
        System.out.println("Pokrećem dnevnu kalkulaciju...");
        List<Trade> openTrades = tradeRepository.findByStatus(Status.MATCHED);
        LocalDate currentDate = LocalDate.now();

        if(!openTrades.isEmpty()){
            kafkaService.sendDailyBalanceRequest(openTrades, currentDate);
        }

        closeExpiredTrades(currentDate);
    }


    public void deleteTrade(UUID id) {
        Trade trade = tradeRepository.findById(id)
                .orElseThrow(() -> new DataRetrievalFailureException("Trade not found with id: " + id));

        if (trade.getMatchedTradeId() != null) {
            if(tradeRepository.findById(trade.getMatchedTradeId()).isPresent()) {
                unmatchTrade(trade);
            }
        }

        tradeRepository.deleteById(id);
    }

}
