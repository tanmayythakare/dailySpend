package com.example.dailyspend.repository;

import com.example.dailyspend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Global categories + user's own categories
     */
    @Query("""
        SELECT c FROM Category c
        WHERE c.user IS NULL
           OR c.user.id = :userId
        ORDER BY c.name
    """)
    List<Category> findAvailableCategories(@Param("userId") Long userId);

    /**
     * Find category user is allowed to access
     */
    @Query("""
        SELECT c FROM Category c
        WHERE c.id = :categoryId
          AND (c.user IS NULL OR c.user.id = :userId)
    """)
    Optional<Category> findAccessibleById(
            @Param("categoryId") Long categoryId,
            @Param("userId") Long userId
    );
}
