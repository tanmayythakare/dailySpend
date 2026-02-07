package com.example.dailyspend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public class AccountRequest {

	@NotBlank(message = "Account name must not be blank")
    private String name;

    @NotBlank(message = "Account type must not be blank")
    private String type;

    @PositiveOrZero(message = "Balance must be zero or positive")
    private BigDecimal balance;

    // getters & setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }

    public BigDecimal getBalance() {
        return balance;
    }
    
    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }
}
