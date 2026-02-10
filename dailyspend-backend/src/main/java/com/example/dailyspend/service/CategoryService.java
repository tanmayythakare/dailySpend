package com.example.dailyspend.service;

import com.example.dailyspend.dto.CategoryRequest;
import com.example.dailyspend.entity.Category;
import com.example.dailyspend.entity.User;
import com.example.dailyspend.exception.ResourceNotFoundException;
import com.example.dailyspend.repository.CategoryRepository;
import com.example.dailyspend.util.SecurityUtils;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final SecurityUtils securityUtils;

    public CategoryService(
            CategoryRepository categoryRepository,
            SecurityUtils securityUtils) {
        this.categoryRepository = categoryRepository;
        this.securityUtils = securityUtils;
    }

    // -------- READ (GLOBAL + USER) --------

    @Transactional(readOnly = true)
    public List<Category> findAll() {
        Long userId = securityUtils.getCurrentUserId();
        return categoryRepository.findAvailableCategories(userId);
    }

    @Transactional(readOnly = true)
    public Category findById(Long id) {
        Long userId = securityUtils.getCurrentUserId();
        return categoryRepository.findAccessibleById(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    // -------- CREATE (USER ONLY) --------

    @Transactional
    public Category create(CategoryRequest request) {
        User user = new User();
        user.setId(securityUtils.getCurrentUserId());

        Category category = new Category();
        category.setName(request.getName());
        category.setType(request.getType());
        category.setUser(user); // user-specific

        return categoryRepository.save(category);
    }

    // -------- UPDATE (USER ONLY) --------

    @Transactional
    public Category update(Long id, CategoryRequest request) {
        Category category = findById(id);

        if (category.getUser() == null) {
            throw new IllegalStateException("Cannot modify global category");
        }

        category.setName(request.getName());
        category.setType(request.getType());

        return categoryRepository.save(category);
    }

    // -------- DELETE (USER ONLY) --------

    @Transactional
    public void delete(Long id) {
        Category category = findById(id);

        if (category.getUser() == null) {
            throw new IllegalStateException("Cannot delete global category");
        }

        categoryRepository.delete(category);
    }
}
