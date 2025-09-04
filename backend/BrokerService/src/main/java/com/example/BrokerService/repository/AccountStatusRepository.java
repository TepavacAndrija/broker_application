package com.example.BrokerService.repository;

import com.example.BrokerService.model.AccountStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountStatusRepository extends MongoRepository<AccountStatus, UUID> {
    Optional<AccountStatus> findByAccountIdAndDate(UUID accountId, LocalDateTime date);
    @Query("{'date': {$gte: ?0, $lt: ?1}}")
    List<AccountStatus> findByDateRange(Date startOfDay, Date endOfDay);

}
