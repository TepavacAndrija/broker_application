package com.example.BrokerService.service;

import com.example.BrokerService.model.AccountStatus;
import com.example.BrokerService.model.Trade;
import com.example.BrokerService.repository.AccountRepository;
import com.example.BrokerService.repository.AccountStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountStatusService {

    private final AccountStatusRepository accountStatusRepository;

    public Optional<AccountStatus> findByAccountIdAndDate(UUID accountId, LocalDate date) {
        return accountStatusRepository.findByAccountIdAndDate(accountId,date);
    }

    public void updateOTE(UUID accountId, LocalDate date, BigDecimal ote) {
        AccountStatus status = accountStatusRepository
                .findByAccountIdAndDate(accountId,date)
                .orElseGet(()->{
                    AccountStatus newStatus = new AccountStatus();
                    newStatus.setId(UUID.randomUUID());
                    newStatus.setAccountId(accountId);
                    newStatus.setDate(date);
                    return newStatus;
                });
        status.setOte(ote);
        accountStatusRepository.save(status);
    }

    public AccountStatus createAccountStatus(CreateAccountStatusDTO asDTO) {
        AccountStatus accountStatus = new AccountStatus();
        accountStatus.setId(UUID.randomUUID());
        accountStatus.setAccountId(asDTO.getAccountId());
        accountStatus.setDate(asDTO.getDate());
        accountStatus.setOte(asDTO.getOte());
        return accountStatusRepository.save(accountStatus);
    }
}
