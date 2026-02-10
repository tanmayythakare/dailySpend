package com.example.dailyspend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PersonBalanceDto {

    private Long id;
    private String name;
    private BigDecimal balance;
    private LocalDateTime createdAt;

    // ===== Constructors =====

    public PersonBalanceDto() {
    }

    public PersonBalanceDto(Long id, String name, BigDecimal balance, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.balance = balance;
        this.createdAt = createdAt;
    }

    // ===== Getters & Setters =====

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}