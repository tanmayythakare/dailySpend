package com.example.dailyspend.util;

import com.example.dailyspend.dto.AccountRequest;
import com.example.dailyspend.dto.AccountResponse;
import com.example.dailyspend.entity.Account;

import java.time.LocalDateTime;

public class AccountMapper {

    public static Account toEntity(AccountRequest request) {
        Account account = new Account();
        account.setName(request.getName());
        account.setType(request.getType());
        account.setBalance(request.getBalance());
        account.setCreatedAt(LocalDateTime.now());
        return account;
    }

    public static AccountResponse toResponse(Account account) {
        AccountResponse response = new AccountResponse();
        response.setId(account.getId());
        response.setName(account.getName());
        response.setType(account.getType());
        response.setBalance(account.getBalance());
        return response;
    }
}
