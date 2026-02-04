package com.example.dailyspend.service;
import java.util.List;

import com.example.dailyspend.dto.AccountBalanceDto;
import com.example.dailyspend.entity.Account;
import com.example.dailyspend.exception.ResourceNotFoundException;
import com.example.dailyspend.repository.AccountRepository;
import com.example.dailyspend.repository.TransactionRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    

    public AccountService(AccountRepository accountRepository,
            TransactionRepository transactionRepository) {
			this.accountRepository = accountRepository;
			this.transactionRepository = transactionRepository;
		}


    public List<Account> findAll() {
        return accountRepository.findAll();
    }

    public Optional<Account> findById(Long id) {
        return accountRepository.findById(id);
    }

    public Account save(Account account) {
        return accountRepository.save(account);
    }

    public void deleteById(Long id) {
        accountRepository.deleteById(id);
    }
    public BigDecimal getAccountBalance(Long accountId) {
        return transactionRepository.calculateAccountBalance(accountId);
    }

    public List<AccountBalanceDto> getAllAccountsWithBalances() {
        return accountRepository.findAllAccountsWithBalances();
    }
    public void deleteAccount(Long accountId) {

        Account account = accountRepository
                .findByIdAndIsDeletedFalse(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        boolean hasTransactions =
                transactionRepository.existsByAccountId(accountId);

        if (hasTransactions) {
            throw new IllegalStateException(
                    "Cannot delete account with existing transactions");
        }

        account.setDeleted(true);
        accountRepository.save(account);
    }


}
