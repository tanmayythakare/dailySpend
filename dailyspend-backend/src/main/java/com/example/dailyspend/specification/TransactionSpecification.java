package com.example.dailyspend.specification;

import com.example.dailyspend.entity.Transaction;
import com.example.dailyspend.entity.TransactionType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class TransactionSpecification {

    private TransactionSpecification() {}

    public static Specification<Transaction> hasUser(Long userId) {
        return (root, query, cb) ->
                cb.equal(root.get("user").get("id"), userId);
    }

    public static Specification<Transaction> isNotDeleted() {
        return (root, query, cb) ->
                cb.isFalse(root.get("deleted"));
    }

    public static Specification<Transaction> hasAccount(Long accountId) {
        if (accountId == null) return null;
        return (root, query, cb) ->
                cb.equal(root.get("account").get("id"), accountId);
    }

    public static Specification<Transaction> hasPerson(Long personId) {
        if (personId == null) return null;
        return (root, query, cb) ->
                cb.equal(root.get("person").get("id"), personId);
    }

    public static Specification<Transaction> hasType(TransactionType type) {
        if (type == null) return null;
        return (root, query, cb) ->
                cb.equal(root.get("type"), type);
    }

    public static Specification<Transaction> betweenDates(
            LocalDate fromDate,
            LocalDate toDate
    ) {
        if (fromDate == null || toDate == null) return null;

        return (root, query, cb) ->
                cb.between(
                        root.get("transactionDate"),
                        fromDate,
                        toDate
                );
    }
}
