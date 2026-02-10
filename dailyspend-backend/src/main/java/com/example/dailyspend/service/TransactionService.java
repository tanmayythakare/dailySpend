package com.example.dailyspend.service;

import com.example.dailyspend.dto.*;
import com.example.dailyspend.entity.*;
import com.example.dailyspend.exception.ResourceNotFoundException;
import com.example.dailyspend.repository.*;
import com.example.dailyspend.specification.TransactionSpecification;
import com.example.dailyspend.util.SecurityUtils;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final PersonRepository personRepository;
    private final SecurityUtils securityUtils;

    public TransactionService(
            TransactionRepository transactionRepository,
            AccountRepository accountRepository,
            CategoryRepository categoryRepository,
            PersonRepository personRepository,
            SecurityUtils securityUtils) {

        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.personRepository = personRepository;
        this.securityUtils = securityUtils;
    }

    // ================= LEGACY (CONTROLLER EXPECTS THIS) =================

    @Transactional
    public Transaction createTransaction(TransactionRequest request) {
        throw new UnsupportedOperationException(
                "Use semantic APIs: /transactions/expense, /money-given, /money-taken"
        );
    }

    @Transactional(readOnly = true)
    public List<Transaction> findAll() {
        Long userId = securityUtils.getCurrentUserId();
        return transactionRepository.findByUserIdAndDeletedFalse(userId);
    }

    @Transactional(readOnly = true)
    public Optional<Transaction> findById(Long id) {
        return transactionRepository.findById(id);
    }

    // ================= SEMANTIC APIs =================

    @Transactional
    public Transaction createExpense(ExpenseRequestDto request) {
        Transaction tx = createBaseTransaction(
                request.getAccountId(),
                request.getCategoryId(),
                request.getPersonId(),
                request.getDescription(),
                request.getTransactionDate()
        );
        tx.setType(TransactionType.EXPENSE);
        return save(tx);
    }

    @Transactional
    public Transaction createMoneyGiven(MoneyGivenRequestDto request) {
        Transaction tx = createBaseTransaction(
                request.getAccountId(),
                null,
                request.getPersonId(),
                request.getDescription(),
                request.getTransactionDate()
        );
        tx.setType(TransactionType.MONEY_GIVEN);
        return save(tx);
    }

    @Transactional
    public Transaction createMoneyTaken(MoneyTakenRequestDto request) {
        Transaction tx = createBaseTransaction(
                request.getAccountId(),
                null,
                request.getPersonId(),
                request.getDescription(),
                request.getTransactionDate()
        );
        tx.setType(TransactionType.MONEY_TAKEN);
        return save(tx);
    }

    // ================= UPDATE =================

    @Transactional
    public Transaction updateTransaction(Long transactionId, TransactionUpdateRequest request) {
        Transaction existing = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        existing.setDescription(request.getDescription());
        existing.setTransactionDate(
                request.getTransactionDate() != null
                        ? request.getTransactionDate()
                        : existing.getTransactionDate()
        );

        return transactionRepository.save(existing);
    }

    // ================= DELETE (THIS WAS MISSING) =================

    @Transactional
    public void deleteTransaction(Long transactionId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (tx.isDeleted()) return; 
        
        

        tx.setDeleted(true);
        transactionRepository.save(tx);
    }

    // ================= FILTER =================

    public Page<Transaction> filterTransactions(TransactionFilterDto filter, Pageable pageable) {
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

    // ================= HELPERS =================

    private Transaction createBaseTransaction(
            Long accountId,
            Long categoryId,
            Long personId,
            String description,
            LocalDate date) {

        Transaction tx = new Transaction();

        tx.setAccount(accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found")));

        tx.setCategory(categoryId != null
                ? categoryRepository.findById(categoryId).orElse(null)
                : null);

        tx.setPerson(personId != null
                ? personRepository.findById(personId).orElse(null)
                : null);

        tx.setDescription(description);
        tx.setTransactionDate(date != null ? date : LocalDate.now());

        // 🔒 USER ISOLATION
        User user = new User();
        user.setId(securityUtils.getCurrentUserId());
        tx.setUser(user);

        return tx;
    }

    private Transaction save(Transaction tx) {
        return transactionRepository.save(tx);
    }
}
