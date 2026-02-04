package com.example.dailyspend.dto;

import java.math.BigDecimal;

public class AccountBalanceDto {
	public AccountBalanceDto(Long accountId, String accountName, BigDecimal balance) {
	    this.accountId = accountId;
	    this.accountName = accountName;
	    this.balance = balance;
	}


    private Long accountId;
    private String accountName;
    private BigDecimal balance;

    // getters & setters

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }
}
