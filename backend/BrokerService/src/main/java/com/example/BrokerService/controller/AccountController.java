package com.example.BrokerService.controller;

import com.example.BrokerService.model.Account;
import com.example.BrokerService.service.AccountService;
import com.example.BrokerService.service.CreateAccountDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class AccountController {

    private final AccountService accountService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<Account> createAccount(@RequestBody CreateAccountDTO accountDTO) {
        Account account = accountService.createAccount(accountDTO);
        messagingTemplate.convertAndSend("/topic/accounts", account);
        return ResponseEntity.ok(account);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<Account>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Account> updateAccount(
            @PathVariable UUID id,
            @RequestBody CreateAccountDTO request) {
        Account updateAccount = accountService.updateAccount(id, request);
        messagingTemplate.convertAndSend("/topic/accounts/update", updateAccount);
        return ResponseEntity.ok(accountService.updateAccount(id, request));
    }
    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccountById(@PathVariable UUID id) {
        return ResponseEntity.of(accountService.getAccountById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable UUID id) {
        accountService.deleteAccount(id);
        messagingTemplate.convertAndSend("/topic/accounts/deleted", id.toString());
        return ResponseEntity.noContent().build();
    }
}