package com.example.dailyspend.specification;

import com.example.dailyspend.entity.Transaction;
import com.example.dailyspend.entity.TransactionType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class TransactionSpecification {

    private TransactionSpecification() {

    }
    private static Specification<Transaction> notDeleted() {
        return (root, query, cb) ->
                cb.isFalse(root.get("deleted"));
    }

    public static Specification<Transaction> byAccount(Long accountId) {
        return Specification
                .where(notDeleted())
                .and((root, query, cb) ->
                        cb.equal(root.get("account").get("id"), accountId)
                );
    }

    public static Specification<Transaction> byCategory(Long categoryId) {
        return Specification
                .where(notDeleted())
                .and((root, query, cb) ->
                        cb.equal(root.get("category").get("id"), categoryId)
                );
    }

    public static Specification<Transaction> byPerson(Long personId) {
        return Specification
                .where(notDeleted())
                .and((root, query, cb) ->
                        cb.equal(root.get("person").get("id"), personId)
                );
    }

    public static Specification<Transaction> byType(TransactionType type) {
        return Specification
                .where(notDeleted())
                .and((root, query, cb) ->
                        cb.equal(root.get("type"), type)
                );
    }

    public static Specification<Transaction> fromDate(LocalDate fromDate) {
        return Specification
                .where(notDeleted())
                .and((root, query, cb) ->
                        cb.greaterThanOrEqualTo(
                                root.get("transactionDate"), fromDate
                        )
                );
    }

    public static Specification<Transaction> toDate(LocalDate toDate) {
        return Specification
                .where(notDeleted())
                .and((root, query, cb) ->
                        cb.lessThanOrEqualTo(
                                root.get("transactionDate"), toDate
                        )
                );
    }

    public static Specification<Transaction> dateBetween(
            LocalDate fromDate,
            LocalDate toDate
    ) {
        return Specification
                .where(notDeleted())
                .and((root, query, cb) ->
                        cb.between(
                                root.get("transactionDate"),
                                fromDate,
                                toDate
                        )
                );
    }
}
