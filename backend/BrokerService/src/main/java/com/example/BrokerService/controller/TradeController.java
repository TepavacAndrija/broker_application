package com.example.BrokerService.controller;

import com.example.BrokerService.model.Trade;
import com.example.BrokerService.service.CreateTradeDTO;
import com.example.BrokerService.service.TradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trades")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class TradeController {
    private final TradeService tradeService;

    @PostMapping
    public ResponseEntity<Trade> createTrade(@RequestBody CreateTradeDTO tradeDTO) {
        Trade trade = tradeService.createTrade(tradeDTO);
        return ResponseEntity.ok(trade);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<Trade>> getAllTrades() {
        return ResponseEntity.ok(tradeService.getAllTrades());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trade> getTradeById(@PathVariable UUID id) {
        return ResponseEntity.of(tradeService.getTradeById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trade> updateTradeById(@PathVariable UUID id, @RequestBody CreateTradeDTO tradeDTO) {
        Trade updatedTrade = tradeService.updateTrade(id, tradeDTO);
        return ResponseEntity.ok(updatedTrade);
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<Trade>> getTradesByAccountId(@PathVariable UUID accountId) {
        return ResponseEntity.ok(tradeService.getAllTradesByAccountId(accountId));
    }

    @PostMapping("/{id}/exercise")
    public ResponseEntity<Trade> exerciseTrade(@PathVariable UUID id) {
        tradeService.exerciseTrade(id, LocalDate.now());
        return ResponseEntity.of(tradeService.getTradeById(id));
    }
}
