package com.example.BrokerService.repository;

import com.example.BrokerService.model.AccountStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface AccountStatusRepository extends MongoRepository<AccountStatus, UUID> {
    Optional<AccountStatus> findByAccountIdAndDate(UUID accountId, LocalDate date);
}
