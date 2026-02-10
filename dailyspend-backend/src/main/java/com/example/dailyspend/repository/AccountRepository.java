package com.example.dailyspend.repository;

import com.example.dailyspend.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface AccountRepository extends JpaRepository<Account, Long> {

    /**
     * Derived balance calculated from transactions using TransactionType.
     *
     * EXPENSE      -> subtract
     * MONEY_GIVEN  -> subtract
     * MONEY_TAKEN  -> add
     */
    @Query("""
        SELECT COALESCE(SUM(
            CASE
                WHEN t.type = 'EXPENSE' THEN -t.amount
                WHEN t.type = 'MONEY_GIVEN' THEN -t.amount
                WHEN t.type = 'MONEY_TAKEN' THEN t.amount
                ELSE 0
            END
        ), 0)
        FROM Transaction t
        WHERE t.account.id = :accountId AND t.deleted = false
    """)
    BigDecimal getDerivedBalance(@Param("accountId") Long accountId);
}
