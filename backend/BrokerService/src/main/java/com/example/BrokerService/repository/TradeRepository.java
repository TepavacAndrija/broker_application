package com.example.BrokerService.repository;

import com.example.BrokerService.model.Status;
import com.example.BrokerService.model.Trade;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface TradeRepository extends MongoRepository<Trade,UUID> {
    List<Trade> findByInstrumentId(UUID instrumentId);
    List<Trade> findByAccountId(UUID accountId);
    @Query("{'maturityDate': {$lt: ?0}, 'status': 'OPEN'}")
    List<Trade> findExpiredTrades(LocalDate currentDate);
    List<Trade> findByStatus(Status status);
}
