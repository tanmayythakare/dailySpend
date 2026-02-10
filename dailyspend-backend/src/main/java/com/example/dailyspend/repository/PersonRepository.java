package com.example.dailyspend.repository;

import com.example.dailyspend.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface PersonRepository extends JpaRepository<Person, Long> {

    /**
     * Calculate person balance:
     * - MONEY_GIVEN adds to what they owe you (positive)
     * - MONEY_TAKEN subtracts from what they owe you (negative)
     * 
     * Positive balance = They owe you money
     * Negative balance = You owe them money
     */
    @Query("""
        SELECT COALESCE(
            SUM(
                CASE 
                    WHEN t.type = 'MONEY_GIVEN' THEN t.amount
                    WHEN t.type = 'MONEY_TAKEN' THEN -t.amount
                    ELSE 0
                END
            ), 0)
        FROM Transaction t
        WHERE t.person.id = :personId
          AND t.deleted = false
    """)
    BigDecimal calculatePersonBalance(@Param("personId") Long personId);
}