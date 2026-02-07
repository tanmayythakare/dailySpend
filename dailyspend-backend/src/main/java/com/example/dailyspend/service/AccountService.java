package com.example.dailyspend.service;

import com.example.dailyspend.dto.AccountRequest;
import com.example.dailyspend.dto.AccountResponse;
import com.example.dailyspend.entity.Account;
import com.example.dailyspend.exception.ResourceNotFoundException;
import com.example.dailyspend.repository.AccountRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    // -------- READ --------

    public List<AccountResponse> findAll() {
        return accountRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AccountResponse findById(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        return toResponse(account);
    }

    // -------- CREATE --------

    @Transactional
    public AccountResponse createAccount(AccountRequest request) {
        Account account = new Account();
        account.setName(request.getName());
        account.setType(request.getType());
        account.setBalance(request.getBalance());

        return toResponse(accountRepository.save(account));
    }

    // -------- BALANCE --------

    /**
     * Derived balance — calculated from transactions
     */
    public BigDecimal getAccountBalance(Long accountId) {
        accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        return accountRepository.getDerivedBalance(accountId);
    }

    // -------- MAPPER --------

    private AccountResponse toResponse(Account account) {
        AccountResponse response = new AccountResponse();
        response.setId(account.getId());
        response.setName(account.getName());
        response.setType(account.getType());
        response.setBalance(account.getBalance());
        return response;
    }
}
