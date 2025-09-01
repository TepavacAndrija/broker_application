package com.example.BrokerService.controller;

import com.example.BrokerService.model.Instrument;
import com.example.BrokerService.service.CreateInstrumentDTO;
import com.example.BrokerService.service.InstrumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/instruments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class InstrumentController {

    private final InstrumentService instrumentService;

    @PostMapping
    public ResponseEntity<Instrument> createInstrument(@RequestBody CreateInstrumentDTO instrumentDTO) {
        return ResponseEntity.ok(instrumentService.createInstrument(instrumentDTO));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<Instrument>> getAllInstruments() {
        return ResponseEntity.ok(instrumentService.getAllInstruments());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Instrument> updateInstrument(@PathVariable UUID id, @RequestBody CreateInstrumentDTO instrumentDTO) {
        Instrument updated = instrumentService.updateInstrument(id, instrumentDTO);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Instrument> getInstrumentById(@PathVariable UUID id) {
        return ResponseEntity.of(instrumentService.getInstrumentById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstrument(@PathVariable UUID id) {
        instrumentService.deleteInstrument(id);
        return ResponseEntity.noContent().build();
    }
}
