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
import java.math.BigDecimal;
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

    @Transactional
    public Transaction createExpense(ExpenseRequestDto request) {

        Transaction tx = createBaseTransaction(
                request.getAccountId(),
                request.getCategoryId(),
                request.getPersonId(),
                request.getDescription(),
                request.getTransactionDate()
        );

        tx.setAmount(request.getAmount());
        tx.setType(TransactionType.EXPENSE);
        applyBalanceEffect(tx, true);

        return transactionRepository.save(tx);
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

        tx.setAmount(request.getAmount());
        tx.setType(TransactionType.MONEY_GIVEN);
        applyBalanceEffect(tx, true);

        return transactionRepository.save(tx);
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

        tx.setAmount(request.getAmount());
        tx.setType(TransactionType.MONEY_TAKEN);
        applyBalanceEffect(tx, true);

        return transactionRepository.save(tx);
    }

    @Transactional
    public Transaction updateTransaction(Long transactionId, TransactionUpdateRequest request) {

        Long userId = securityUtils.getCurrentUserId();

        Transaction existing = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!existing.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (request.getAmount() != null) {
            existing.setAmount(request.getAmount());
        }

        if (request.getType() != null) {
            existing.setType(request.getType());
        }

        if (request.getDescription() != null) {
            existing.setDescription(request.getDescription());
        }
        if (request.getTransactionDate() != null) {
            existing.setTransactionDate(request.getTransactionDate());
        }

        if (request.getAccountId() != null) {
            Account account = accountRepository.findById(request.getAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
            existing.setAccount(account);
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            existing.setCategory(category);
        } else {
            existing.setCategory(null);
        }

        if (request.getPersonId() != null) {
            Person person = personRepository.findById(request.getPersonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Person not found"));
            existing.setPerson(person);
        } else {
            existing.setPerson(null);
        }

        return transactionRepository.save(existing);
    }

    @Transactional
    public void deleteTransaction(Long transactionId) {

        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (tx.isDeleted()) return;

        applyBalanceEffect(tx, false);
        tx.setDeleted(true);
        transactionRepository.save(tx);
    }

    @Transactional(readOnly = true)
    public Page<Transaction> filterTransactions(TransactionFilterDto filter, Pageable pageable) {

        Long userId = securityUtils.getCurrentUserId();

        Specification<Transaction> spec =
                Specification.where(TransactionSpecification.hasUser(userId))
                        .and(TransactionSpecification.isNotDeleted())
                        .and(TransactionSpecification.hasAccount(filter.getAccountId()))
                        .and(TransactionSpecification.hasType(filter.getType()))
                        .and(TransactionSpecification.hasPerson(filter.getPersonId()))
                        .and(TransactionSpecification.betweenDates(
                                filter.getStartDate(),
                                filter.getEndDate()
                        ));

        return transactionRepository.findAll(spec, pageable);
    }

    private void applyBalanceEffect(Transaction tx, boolean apply) {

        Account account = tx.getAccount();
        BigDecimal amount = tx.getAmount();

        if (account == null || amount == null) {
            throw new IllegalStateException("Account or amount cannot be null");
        }

        if (!apply) {
            amount = amount.negate();
        }

        switch (tx.getType()) {

            case EXPENSE:
            case MONEY_GIVEN:
                account.setBalance(account.getBalance().subtract(amount));
                break;

            case MONEY_TAKEN:
                account.setBalance(account.getBalance().add(amount));
                break;

            default:
                throw new IllegalStateException("Unknown transaction type");
        }

        accountRepository.save(account);
    }

    private Transaction createBaseTransaction(
            Long accountId,
            Long categoryId,
            Long personId,
            String description,
            LocalDate date) {

        Transaction tx = new Transaction();
        Long userId = securityUtils.getCurrentUserId();

        Account account = accountRepository
                .findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        tx.setAccount(account);
        tx.setCategory(categoryId != null
                ? categoryRepository.findById(categoryId).orElse(null)
                : null);

        tx.setPerson(personId != null
                ? personRepository.findById(personId).orElse(null)
                : null);

        tx.setDescription(description);
        tx.setTransactionDate(date != null ? date : LocalDate.now());

        User user = new User();
        user.setId(securityUtils.getCurrentUserId());
        tx.setUser(user);

        return tx;
    }
    private Transaction save(Transaction tx) {
        return transactionRepository.save(tx);
    }
}
