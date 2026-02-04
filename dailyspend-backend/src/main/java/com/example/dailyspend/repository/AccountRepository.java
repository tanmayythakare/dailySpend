package com.example.dailyspend.repository;
import java.util.List;
import java.util.Optional;

import com.example.dailyspend.entity.Account;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.example.dailyspend.dto.AccountBalanceDto;

public interface AccountRepository extends JpaRepository<Account, Long> {
	
	@Query("""
		    SELECT new com.example.dailyspend.dto.AccountBalanceDto(
		        a.id,
		        a.name,
		        COALESCE(
		            SUM(
		                CASE
		                    WHEN c.type = 'INCOME' THEN t.amount
		                    ELSE -t.amount
		                END
		            ), 0
		        )
		    )
		    FROM Account a
		    LEFT JOIN Transaction t ON t.account.id = a.id
		    LEFT JOIN t.category c
		    GROUP BY a.id, a.name
		""")
		List<AccountBalanceDto> findAllAccountsWithBalances();
		
	List<Account> findByIsDeletedFalse();
	Optional<Account> findByIdAndIsDeletedFalse(Long id);


}
