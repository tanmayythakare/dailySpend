package com.example.dailyspend.controller;

import com.example.dailyspend.dto.*;
import com.example.dailyspend.entity.Transaction;
import com.example.dailyspend.service.TransactionService;
import com.example.dailyspend.dto.MoneyGivenRequestDto;
import com.example.dailyspend.dto.MoneyTakenRequestDto;
import com.example.dailyspend.entity.TransactionType;


import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // -------- BASIC READ APIs --------

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id) {
        return transactionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // -------- LEGACY CREATE (KEEP FOR NOW) --------

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request) {

        Transaction saved = transactionService.createTransaction(request);
        return ResponseEntity.ok(toResponse(saved));
    }

    // -------- SEMANTIC APIs --------

    @PostMapping("/expense")
    public ResponseEntity<TransactionResponse> createExpense(
            @Valid @RequestBody ExpenseRequestDto request) {

        Transaction tx = transactionService.createExpense(request);
        return ResponseEntity.ok(toResponse(tx));
    }
    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionUpdateRequest request) {

        Transaction updated = transactionService.updateTransaction(id, request);
        return ResponseEntity.ok(toResponse(updated));
    }


    @PostMapping("/money-given")
    public ResponseEntity<TransactionResponse> createMoneyGiven(
            @Valid @RequestBody MoneyGivenRequestDto request) {

        Transaction tx = transactionService.createMoneyGiven(request);
        return ResponseEntity.ok(toResponse(tx));
    }

    @PostMapping("/money-taken")
    public ResponseEntity<TransactionResponse> createMoneyTaken(
            @Valid @RequestBody MoneyTakenRequestDto request) {

        Transaction tx = transactionService.createMoneyTaken(request);
        return ResponseEntity.ok(toResponse(tx));
    }

    // -------- PAGED FILTER --------

    @GetMapping("/paged")
    public ResponseEntity<Page<TransactionResponse>> getPagedTransactions(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.fromString(direction), sortBy)
        );

        Page<TransactionResponse> response = transactionService
                .getTransactions(startDate, endDate, pageable)
                .map(this::toResponse);

        return ResponseEntity.ok(response);
    }

    // -------- RESPONSE MAPPER --------

    private TransactionResponse toResponse(Transaction tx) {
        TransactionResponse response = new TransactionResponse();
        response.setId(tx.getId());
        response.setAmount(tx.getAmount());
        response.setTransactionDate(tx.getTransactionDate());
        response.setDescription(tx.getDescription());
        response.setAccountName(tx.getAccount().getName());

        if (tx.getCategory() != null) {
            response.setCategoryName(tx.getCategory().getName());
        }

        if (tx.getPerson() != null) {
            response.setPersonName(tx.getPerson().getName());
        }

        return response;
    }
    @GetMapping("/filter")
    public ResponseEntity<Page<TransactionResponse>> filterTransactions(
            TransactionFilterDto filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.fromString(direction), sortBy)
        );

        Page<TransactionResponse> response =
                transactionService.filterTransactions(filter, pageable)
                        .map(this::toResponse);

        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }


}
