package com.example.BrokerService.service;

import com.example.BrokerService.model.Account;
import com.example.BrokerService.repository.AccountRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository accountRepository;

    public Account createAccount(CreateAccountDTO accountDTO) {
        Account account = new Account();
        account.setId(UUID.randomUUID());
        account.setName(accountDTO.getName());
        account.setUserInfo(accountDTO.getUserInfo());
        return accountRepository.save(account);
    }

    public Optional<Account> getAccountById(UUID id) {
        return accountRepository.findById(id);
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public void deleteAccount(UUID id) {
        if (!accountRepository.existsById(id)) {
            throw new DataRetrievalFailureException("Account not found with id: " + id);
        }
        accountRepository.deleteById(id);
    }
}
