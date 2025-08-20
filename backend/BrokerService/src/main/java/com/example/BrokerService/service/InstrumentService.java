package com.example.BrokerService.service;

import com.example.BrokerService.model.Instrument;
import com.example.BrokerService.repository.InstrumentRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InstrumentService {
    private final InstrumentRepository instrumentRepository;

    public Instrument createInstrument(CreateInstrumentDTO instrumentDTO) {
        Instrument instrument = new Instrument();
        instrument.setId(UUID.randomUUID());
        instrument.setCode(instrumentDTO.getCode());
        instrument.setMaturityDate(instrumentDTO.getMaturityDate());
        return instrumentRepository.save(instrument);
    }

    public Optional<Instrument> getInstrumentById(UUID id) {
        return instrumentRepository.findById(id);
    }

    public List<Instrument> getAllInstruments() {
        return instrumentRepository.findAll();
    }

    public void deleteInstrument(UUID id) {
        if (!instrumentRepository.existsById(id)) {
            throw new DataRetrievalFailureException("Instrument not found with id: " + id);
        }
        instrumentRepository.deleteById(id);
    }
}
