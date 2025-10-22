package com.example.BrokerService.service;

import com.example.BrokerService.model.AccountStatus;
import com.example.BrokerService.repository.AccountStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountStatusService {

    private final AccountStatusRepository accountStatusRepository;

    public Optional<AccountStatus> findByAccountIdAndDate(UUID accountId, LocalDateTime date) {
        return accountStatusRepository.findByAccountIdAndDate(accountId,date);
    }

    public void updateOTE(UUID accountId, LocalDate date, BigDecimal ote) {


        AccountStatus status = accountStatusRepository
                .findByAccountIdAndDate(accountId,date.atTime(LocalTime.NOON))
                .orElseGet(()->{
                    AccountStatus newStatus = new AccountStatus();
                    newStatus.setId(UUID.randomUUID());
                    newStatus.setAccountId(accountId);
                    newStatus.setDate(date.atTime(LocalTime.NOON));
                    return newStatus;
                });
        status.setOte(ote);
        accountStatusRepository.save(status);
    }

    public List<AccountStatus> getAllByDate(LocalDate date) {
        Date startOfDay = Date.from(date.atStartOfDay(ZoneOffset.UTC).toInstant());
        Date endOfDay = Date.from(date.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant());
        System.out.println(startOfDay + " to je bio pocetak, a kraj je " + endOfDay);
        return accountStatusRepository.findByDateRange(startOfDay, endOfDay);
    }

    public AccountStatus createAccountStatus(CreateAccountStatusDTO asDTO) {
        AccountStatus accountStatus = new AccountStatus();
        accountStatus.setId(UUID.randomUUID());
        accountStatus.setAccountId(asDTO.getAccountId());
        accountStatus.setDate(asDTO.getDate().toLocalDate().atTime(LocalTime.NOON));
        accountStatus.setOte(asDTO.getOte());
        return accountStatusRepository.save(accountStatus);
    }
}
