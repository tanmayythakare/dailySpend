package com.example.dailyspend.controller;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;

import com.example.dailyspend.dto.TransactionRequest;
import com.example.dailyspend.dto.TransactionResponse;
import com.example.dailyspend.entity.Transaction;
import com.example.dailyspend.service.TransactionService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Pageable;
@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

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
    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request) {

        Transaction saved = transactionService.createTransaction(request);

        TransactionResponse response = new TransactionResponse();
        response.setId(saved.getId());
        response.setAmount(saved.getAmount());
        response.setTransactionDate(saved.getTransactionDate());
        response.setDescription(saved.getDescription());
        response.setAccountName(saved.getAccount().getName());
        response.setCategoryName(saved.getCategory().getName());

        if (saved.getPerson() != null) {
            response.setPersonName(saved.getPerson().getName());
        }

        return ResponseEntity.ok(response);
    }
    @GetMapping("/paged")
    public ResponseEntity<Page<TransactionResponse>> getPagedTransactions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
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
                .map(tx -> {
                    TransactionResponse dto = new TransactionResponse();
                    dto.setId(tx.getId());
                    dto.setAmount(tx.getAmount());
                    dto.setTransactionDate(tx.getTransactionDate());
                    dto.setDescription(tx.getDescription());
                    dto.setAccountName(tx.getAccount().getName());
                    dto.setCategoryName(tx.getCategory().getName());
                    if (tx.getPerson() != null) {
                        dto.setPersonName(tx.getPerson().getName());
                    }
                    return dto;
                });

        return ResponseEntity.ok(response);
    }


}
