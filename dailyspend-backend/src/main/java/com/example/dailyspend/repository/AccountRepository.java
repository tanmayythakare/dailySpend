package com.example.dailyspend.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.dailyspend.entity.Account;

public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByUserId(Long userId);

    Optional<Account> findByIdAndUserId(Long id, Long userId);

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
