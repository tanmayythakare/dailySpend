package com.example.dailyspend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PersonLedgerSummaryDto {

    private Long personId;
    private String personName;
    private BigDecimal currentBalance;
    private BigDecimal totalMoneyGiven;
    private BigDecimal totalMoneyTaken;
    private LocalDate lastTransactionDate;
    private long transactionCount;

    // ===== Constructors =====

    public PersonLedgerSummaryDto() {
    }

    public PersonLedgerSummaryDto(
            Long personId,
            String personName,
            BigDecimal currentBalance,
            BigDecimal totalMoneyGiven,
            BigDecimal totalMoneyTaken,
            LocalDate lastTransactionDate,
            long transactionCount) {
        this.personId = personId;
        this.personName = personName;
        this.currentBalance = currentBalance;
        this.totalMoneyGiven = totalMoneyGiven;
        this.totalMoneyTaken = totalMoneyTaken;
        this.lastTransactionDate = lastTransactionDate;
        this.transactionCount = transactionCount;
    }

    // ===== Getters & Setters =====

    public Long getPersonId() {
        return personId;
    }

    public void setPersonId(Long personId) {
        this.personId = personId;
    }

    public String getPersonName() {
        return personName;
    }

    public void setPersonName(String personName) {
        this.personName = personName;
    }

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }

    public void setCurrentBalance(BigDecimal currentBalance) {
        this.currentBalance = currentBalance;
    }

    public BigDecimal getTotalMoneyGiven() {
        return totalMoneyGiven;
    }

    public void setTotalMoneyGiven(BigDecimal totalMoneyGiven) {
        this.totalMoneyGiven = totalMoneyGiven;
    }

    public BigDecimal getTotalMoneyTaken() {
        return totalMoneyTaken;
    }

    public void setTotalMoneyTaken(BigDecimal totalMoneyTaken) {
        this.totalMoneyTaken = totalMoneyTaken;
    }

    public LocalDate getLastTransactionDate() {
        return lastTransactionDate;
    }

    public void setLastTransactionDate(LocalDate lastTransactionDate) {
        this.lastTransactionDate = lastTransactionDate;
    }

    public long getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(long transactionCount) {
        this.transactionCount = transactionCount;
    }
}