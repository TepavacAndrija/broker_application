package com.example.BrokerService.repository;

import com.example.BrokerService.model.Account;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.UUID;

public interface AccountRepository extends MongoRepository<Account, UUID> {
}
