package com.example.BrokerService.service;

import com.example.BrokerService.model.Instrument;
import com.example.BrokerService.repository.InstrumentRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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

    public Instrument updateInstrument(UUID id, CreateInstrumentDTO instrumentDTO) {
        Optional<Instrument> instrument = instrumentRepository.findById(id);
        if(instrument.isPresent()) {
            Instrument instrumentToUpdate = instrument.get();
            if(instrumentDTO.getMaturityDate() != null) {
                if (instrumentDTO.getMaturityDate().isBefore(LocalDate.now())) {
                    throw new IllegalArgumentException("Maturity date cannot be in the past");
                }
                instrumentToUpdate.setMaturityDate(instrumentDTO.getMaturityDate());
            }
            if(instrumentDTO.getCode() != null) {
                instrumentToUpdate.setCode(instrumentDTO.getCode());
            }
            return instrumentRepository.save(instrumentToUpdate);
        }
        else  {
            throw new DataRetrievalFailureException("User with id " + id + " not found");
        }
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
