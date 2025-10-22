package com.example.BrokerService.controller;

import com.example.BrokerService.model.Account;
import com.example.BrokerService.model.AccountStatus;
import com.example.BrokerService.service.AccountStatusService;
import com.example.BrokerService.service.CreateAccountDTO;
import com.example.BrokerService.service.CreateAccountStatusDTO;
import com.example.BrokerService.service.TradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/account-status")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AccountStatusController {

    private final AccountStatusService accountStatusService;
    private final TradeService tradeService;

    @GetMapping("/{accountId}/date/{date}")
    public ResponseEntity<AccountStatus> getStatusByAccountAndDate(
            @PathVariable UUID accountId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date)
    {
        return ResponseEntity.of(accountStatusService.findByAccountIdAndDate(accountId, date.atTime(LocalTime.NOON)));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<AccountStatus>> getAllStatusesForDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        System.out.println("Datum je="+date + "i svi koji postoje su "+ accountStatusService.getAllByDate(date));
        return ResponseEntity.ok(accountStatusService.getAllByDate(date));
    }
    @PostMapping("/trigger-daily-balance")
    @PreAuthorize("hasRole('MANAGER')")
    public void triggerDailyBalanceCalculation() {
        tradeService.triggerDailyBalanceCalculation();
        }
//    @PostMapping("/{accountId}/date/{date}/ote")
//    public ResponseEntity<AccountStatus> updateOTE(
//            @PathVariable UUID accountId,
//            @PathVariable @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate date,
//            @RequestBody BigDecimal ote){
//        accountStatusService.updateOTE(accountId, date, ote);
//        return ResponseEntity.noContent().build();
//    }

//    @PostMapping
//    public ResponseEntity<AccountStatus> createAccountStatus(@RequestBody CreateAccountStatusDTO asDTO) {
//        AccountStatus as = accountStatusService.createAccountStatus(asDTO);
//        return ResponseEntity.ok(as);
//    }
}
