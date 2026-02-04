package com.example.dailyspend.repository;

import com.example.dailyspend.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByTransactionDateBetween(
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable
    );
    boolean existsByAccountId(Long accountId);

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.category.type = 'INCOME'
    """)
    BigDecimal totalIncome();

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.category.type = 'EXPENSE'
    """)
    BigDecimal totalExpense();
    @Query("""
    	    SELECT COALESCE(
    	        SUM(
    	            CASE 
    	                WHEN t.category.type = 'INCOME' THEN t.amount
    	                ELSE -t.amount
    	            END
    	        ), 0)
    	    FROM Transaction t
    	    WHERE t.account.id = :accountId
    	""")
    	BigDecimal calculateAccountBalance(Long accountId);

}
