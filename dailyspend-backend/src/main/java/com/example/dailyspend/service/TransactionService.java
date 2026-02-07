
package com.example.dailyspend.service;
import com.example.dailyspend.dto.ExpenseRequestDto;
import com.example.dailyspend.dto.MoneyGivenRequestDto;
import com.example.dailyspend.dto.MoneyTakenRequestDto;
import com.example.dailyspend.entity.*;
import com.example.dailyspend.exception.ResourceNotFoundException;
import com.example.dailyspend.repository.*;
import com.example.dailyspend.dto.TransactionFilterDto;
import com.example.dailyspend.specification.TransactionSpecification;
import org.springframework.data.jpa.domain.Specification;

import com.example.dailyspend.dto.TransactionRequest;
import com.example.dailyspend.dto.TransactionUpdateRequest;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final PersonRepository personRepository;

    public TransactionService(
            TransactionRepository transactionRepository,
            AccountRepository accountRepository,
            CategoryRepository categoryRepository,
            PersonRepository personRepository) {

        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.personRepository = personRepository;
    }

    // ---------------- EXISTING API (KEEP FOR NOW) ----------------

    public List<Transaction> findAll() {
        return transactionRepository.findAll();
    }

    public Optional<Transaction> findById(Long id) {
        return transactionRepository.findById(id);
    }

    @Transactional
    public Transaction createTransaction(TransactionRequest request) {
        throw new UnsupportedOperationException(
                "Legacy createTransaction() is disabled. " +
                "Use semantic APIs: /transactions/expense, /transactions/money-given, /transactions/money-taken"
        );
    }
    @Transactional
    public Transaction createMoneyGiven(MoneyGivenRequestDto request) {

        Transaction tx = createBaseTransaction(
                request.getAmount(),
                request.getAccountId(),
                null,
                request.getPersonId(),
                request.getDescription(),
                request.getTransactionDate()
        );

        tx.setType(TransactionType.MONEY_GIVEN);
        validateTransactionInvariant(tx);

        Transaction savedTx = transactionRepository.save(tx);

        applyBalanceEffect(savedTx);

        return savedTx;
    }
    @Transactional
    public Transaction updateTransaction(
            Long transactionId,
            TransactionUpdateRequest request) {

        Transaction existing = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        // 1️⃣ Reverse old balance effect
        reverseBalanceEffect(existing);

        // 2️⃣ Rebuild transaction
        Transaction updated = createBaseTransaction(
                request.getAmount(),
                request.getAccountId() != null
                        ? request.getAccountId()
                        : existing.getAccount().getId(),
                request.getCategoryId(),
                request.getPersonId(),
                request.getDescription(),
                request.getTransactionDate()
        );

        updated.setId(existing.getId());
        updated.setType(
                request.getType() != null ? request.getType() : existing.getType()
        );

        validateTransactionInvariant(updated);

        // 3️⃣ Save updated transaction
        Transaction saved = transactionRepository.save(updated);

        // 4️⃣ Apply new balance effect
        applyBalanceEffect(saved);

        return saved;
    }

    @Transactional
    public Transaction createMoneyTaken(MoneyTakenRequestDto request) {

        Transaction tx = createBaseTransaction(
                request.getAmount(),
                request.getAccountId(),
                null,
                request.getPersonId(),
                request.getDescription(),
                request.getTransactionDate()
        );

        tx.setType(TransactionType.MONEY_TAKEN);
        validateTransactionInvariant(tx);

        Transaction savedTx = transactionRepository.save(tx);

        applyBalanceEffect(savedTx);

        return savedTx;
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

    // ---------------- NEW SEMANTIC API (STEP 1.5) ----------------

    @Transactional
    public Transaction createExpense(ExpenseRequestDto request) {

        Transaction tx = createBaseTransaction(
                request.getAmount(),
                request.getAccountId(),
                request.getCategoryId(),
                request.getPersonId(),
                request.getDescription(),
                request.getTransactionDate()
        );

        tx.setType(TransactionType.EXPENSE);
        validateTransactionInvariant(tx);

        Transaction savedTx = transactionRepository.save(tx);

        applyBalanceEffect(savedTx);

        return savedTx;
    }
    @Transactional
    public void deleteTransaction(Long transactionId) {

        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (tx.isDeleted()) {
            return; // idempotent
        }

        reverseBalanceEffect(tx);

        tx.setDeleted(true);
        transactionRepository.save(tx);
    }


    // ---------------- STUBS (STEP 1.6) ----------------

    private Transaction createBaseTransaction(
            BigDecimal amount,
            Long accountId,
            Long categoryId,
            Long personId,
            String description,
            LocalDate transactionDate) {

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        Category category = null;
        if (categoryId != null) {
            category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }

        Person person = null;
        if (personId != null) {
            person = personRepository.findById(personId)
                    .orElseThrow(() -> new ResourceNotFoundException("Person not found"));
        }

        Transaction tx = new Transaction();
        tx.setAmount(amount);
        tx.setAccount(account);
        tx.setCategory(category);   // now nullable ✔
        tx.setPerson(person);
        tx.setDescription(description);
        tx.setTransactionDate(
                transactionDate != null ? transactionDate : LocalDate.now()
        );
        return tx;
    }
    private void reverseBalanceEffect(Transaction tx) {

        Account account = tx.getAccount();

        switch (tx.getType()) {
            case EXPENSE, MONEY_GIVEN ->
                    account.setBalance(account.getBalance().add(tx.getAmount()));

            case MONEY_TAKEN ->
                    account.setBalance(account.getBalance().subtract(tx.getAmount()));
        }

        accountRepository.save(account);
    }




    private void applyBalanceEffect(Transaction tx) {

        Account account = tx.getAccount();

        switch (tx.getType()) {
            case EXPENSE ->
                    account.setBalance(account.getBalance().subtract(tx.getAmount()));

            case MONEY_GIVEN ->
                    account.setBalance(account.getBalance().subtract(tx.getAmount()));

            case MONEY_TAKEN ->
                    account.setBalance(account.getBalance().add(tx.getAmount()));
        }

        accountRepository.save(account);
    }
    private void validateTransactionInvariant(Transaction tx) {

        if (tx.getType() == null) {
            throw new IllegalStateException("Transaction type must be set");
        }

        switch (tx.getType()) {

            case EXPENSE -> {
                if (tx.getCategory() == null) {
                    throw new IllegalStateException("EXPENSE must have a category");
                }
            }

            case MONEY_GIVEN, MONEY_TAKEN -> {
                if (tx.getPerson() == null) {
                    throw new IllegalStateException("Money transactions must have a person");
                }
                if (tx.getCategory() != null) {
                    throw new IllegalStateException("Money transactions must not have a category");
                }
            }
        }
    }
    
    public Page<Transaction> filterTransactions(
            TransactionFilterDto filter,
            Pageable pageable) {

        Specification<Transaction> spec =
                Specification.where(TransactionSpecification.hasAccount(filter.getAccountId()))
                        .and(TransactionSpecification.hasPerson(filter.getPersonId()))
                        .and(TransactionSpecification.hasType(filter.getType()))
                        .and(TransactionSpecification.betweenDates(
                                filter.getStartDate(),
                                filter.getEndDate()
                        ));

        return transactionRepository.findAll(spec, pageable);
    }



}
