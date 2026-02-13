package com.example.dailyspend.service;

import com.example.dailyspend.dto.AccountRequest;
import com.example.dailyspend.dto.AccountResponse;
import com.example.dailyspend.entity.Account;
import com.example.dailyspend.entity.User;
import com.example.dailyspend.exception.ResourceNotFoundException;
import com.example.dailyspend.repository.AccountRepository;
import com.example.dailyspend.util.SecurityUtils;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final SecurityUtils securityUtils;

    public AccountService(AccountRepository accountRepository,
                          SecurityUtils securityUtils) {
        this.accountRepository = accountRepository;
        this.securityUtils = securityUtils;
    }

    // -------- READ --------
    @Transactional(readOnly = true)
    public List<AccountResponse> findAll() {
        Long userId = securityUtils.getCurrentUserId();
        return accountRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public AccountResponse findById(Long accountId) {
        Long userId = securityUtils.getCurrentUserId();
        Account account = accountRepository.findById(accountId)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        return toResponse(account);
    }

    // -------- CREATE --------

    @Transactional
public AccountResponse createAccount(AccountRequest request) {

    Long userId = securityUtils.getCurrentUserId();

    Account account = new Account();
    account.setName(request.getName());
    account.setType(request.getType());
    account.setBalance(request.getBalance());

    User user = new User();
    user.setId(userId);
    account.setUser(user);

    return toResponse(accountRepository.save(account));
}
@Transactional
public void deleteAccount(Long id) {

    Long userId = securityUtils.getCurrentUserId();

    Account account = accountRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    
    if (!account.getUser().getId().equals(userId)) {
        throw new RuntimeException("Forbidden: Cannot delete another user's account");
    }

    accountRepository.delete(account);
}



    // -------- BALANCE --------

    @Transactional(readOnly = true)
    public BigDecimal getAccountBalance(Long accountId) {
        Long userId = securityUtils.getCurrentUserId();
        Account account = accountRepository.findById(accountId)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        return accountRepository.getDerivedBalance(account.getId());
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
