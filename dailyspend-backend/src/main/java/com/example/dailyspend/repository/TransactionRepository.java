package com.example.dailyspend.repository;

import com.example.dailyspend.dto.CategorySummaryDto;
import com.example.dailyspend.entity.Transaction;
import com.example.dailyspend.entity.TransactionType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    // ✅ FIXED: Added deleted filter methods
    List<Transaction> findByDeletedFalse();
    
    Page<Transaction> findByDeletedFalse(Pageable pageable);
    
    Page<Transaction> findByTransactionDateBetweenAndDeletedFalse(
        LocalDate startDate,
        LocalDate endDate,
        Pageable pageable
    );

    // Existing date filter (keeps backward compatibility)
    Page<Transaction> findByTransactionDateBetween(
        LocalDate startDate,
        LocalDate endDate,
        Pageable pageable
    );
    boolean existsByPersonId(Long personId);

    List<Transaction> findByPersonIdAndDeletedFalse(Long personId);

    boolean existsByAccountId(Long accountId);

    // ✅ FIXED: Updated to use TransactionType and filter deleted
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.type = 'MONEY_TAKEN'
          AND t.deleted = false
    """)
    BigDecimal totalIncome();

    // ✅ FIXED: Updated to use TransactionType and filter deleted
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.type IN ('EXPENSE', 'MONEY_GIVEN')
          AND t.deleted = false
    """)
    BigDecimal totalExpense();

    // ✅ FIXED: Updated to use TransactionType and filter deleted
    @Query("""
        SELECT COALESCE(
            SUM(
                CASE 
                    WHEN t.type = 'EXPENSE' THEN -t.amount
                    WHEN t.type = 'MONEY_GIVEN' THEN -t.amount
                    WHEN t.type = 'MONEY_TAKEN' THEN t.amount
                    ELSE 0
                END
            ), 0)
        FROM Transaction t
        WHERE t.account.id = :accountId
          AND t.deleted = false
    """)
    BigDecimal calculateAccountBalance(Long accountId);
    
 // ========== ADD THESE QUERIES TO EXISTING TransactionRepository ==========

 // Monthly totals by transaction type
 @Query("""
     SELECT COALESCE(SUM(t.amount), 0)
     FROM Transaction t
     WHERE YEAR(t.transactionDate) = :year
       AND MONTH(t.transactionDate) = :month
       AND t.type = :type
       AND t.deleted = false
 """)
 BigDecimal sumByYearMonthAndType(
     @Param("year") int year,
     @Param("month") int month,
     @Param("type") TransactionType type
 );

 // Count transactions by month
 @Query("""
     SELECT COUNT(t)
     FROM Transaction t
     WHERE YEAR(t.transactionDate) = :year
       AND MONTH(t.transactionDate) = :month
       AND t.deleted = false
 """)
 long countByYearMonth(
     @Param("year") int year,
     @Param("month") int month
 );

 // Category breakdown for a month
 @Query("""
     SELECT new com.example.dailyspend.dto.CategorySummaryDto(
         c.id,
         c.name,
         COALESCE(SUM(t.amount), 0),
         COUNT(t)
     )
     FROM Transaction t
     JOIN t.category c
     WHERE YEAR(t.transactionDate) = :year
       AND MONTH(t.transactionDate) = :month
       AND t.type = 'EXPENSE'
       AND t.deleted = false
     GROUP BY c.id, c.name
     ORDER BY SUM(t.amount) DESC
 """)
 List<CategorySummaryDto> getCategorySummaryByMonth(
     @Param("year") int year,
     @Param("month") int month
 );

 // Date range totals by type
 @Query("""
     SELECT COALESCE(SUM(t.amount), 0)
     FROM Transaction t
     WHERE t.transactionDate BETWEEN :startDate AND :endDate
       AND t.type = :type
       AND t.deleted = false
 """)
 BigDecimal sumByDateRangeAndType(
     @Param("startDate") LocalDate startDate,
     @Param("endDate") LocalDate endDate,
     @Param("type") TransactionType type
 );

 // Count transactions by date range
 @Query("""
     SELECT COUNT(t)
     FROM Transaction t
     WHERE t.transactionDate BETWEEN :startDate AND :endDate
       AND t.deleted = false
 """)
 long countByDateRange(
     @Param("startDate") LocalDate startDate,
     @Param("endDate") LocalDate endDate
 );

 // Get total money given to a person
 @Query("""
     SELECT COALESCE(SUM(t.amount), 0)
     FROM Transaction t
     WHERE t.person.id = :personId
       AND t.type = 'MONEY_GIVEN'
       AND t.deleted = false
 """)
 BigDecimal sumMoneyGivenToPerson(@Param("personId") Long personId);

 // Get total money taken from a person
 @Query("""
     SELECT COALESCE(SUM(t.amount), 0)
     FROM Transaction t
     WHERE t.person.id = :personId
       AND t.type = 'MONEY_TAKEN'
       AND t.deleted = false
 """)
 BigDecimal sumMoneyTakenFromPerson(@Param("personId") Long personId);

 // Get last transaction date for a person
 @Query("""
     SELECT MAX(t.transactionDate)
     FROM Transaction t
     WHERE t.person.id = :personId
       AND t.deleted = false
 """)
 LocalDate getLastTransactionDateForPerson(@Param("personId") Long personId);

 // Count transactions for a person
 @Query("""
     SELECT COUNT(t)
     FROM Transaction t
     WHERE t.person.id = :personId
       AND t.deleted = false
 """)
 long countByPersonId(@Param("personId") Long personId);
}