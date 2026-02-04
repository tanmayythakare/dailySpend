package com.example.dailyspend.service;

import com.example.dailyspend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AnalyticsService {

    private final TransactionRepository transactionRepository;

    public AnalyticsService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public BigDecimal getTotalIncome() {
        return transactionRepository.totalIncome();
    }

    public BigDecimal getTotalExpense() {
        return transactionRepository.totalExpense();
    }

    public BigDecimal getNetBalance() {
        return getTotalIncome().subtract(getTotalExpense());
    }
}
