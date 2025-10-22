package com.example.BrokerService.repository;

import com.example.BrokerService.model.Instrument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.UUID;

public interface InstrumentRepository extends MongoRepository<Instrument, UUID> {
    Optional<Instrument> findByCode(String code);
}
