package com.example.dailyspend.service;
import java.util.List;
import java.time.LocalDate;
import java.util.Optional;
import com.example.dailyspend.dto.TransactionRequest;
import com.example.dailyspend.entity.*;
import com.example.dailyspend.exception.ResourceNotFoundException;
import com.example.dailyspend.repository.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final PersonRepository personRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              AccountRepository accountRepository,
                              CategoryRepository categoryRepository,
                              PersonRepository personRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.personRepository = personRepository;
    }
    public List<Transaction> findAll() {
        return transactionRepository.findAll();
    }

    public Optional<Transaction> findById(Long id) {
        return transactionRepository.findById(id);
    }

    @Transactional
    public Transaction createTransaction(TransactionRequest request) {

        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Person person = null;
        if (request.getPersonId() != null) {
            person = personRepository.findById(request.getPersonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Person not found"));
        }

        // Balance update logic
        if ("INCOME".equalsIgnoreCase(category.getType())) {
            account.setBalance(account.getBalance().add(request.getAmount()));
        } else if ("EXPENSE".equalsIgnoreCase(category.getType())) {
            account.setBalance(account.getBalance().subtract(request.getAmount()));
        }

        accountRepository.save(account);

        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setDescription(request.getDescription());
        transaction.setAccount(account);
        transaction.setCategory(category);
        transaction.setPerson(person);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setUpdatedAt(LocalDateTime.now());

        return transactionRepository.save(transaction);
    }
    public Page<Transaction> getTransactions(
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable) {

        if (startDate != null && endDate != null) {
            return transactionRepository
                    .findByTransactionDateBetween(startDate, endDate, pageable);
        }

        return transactionRepository.findAll(pageable);
    }
}
