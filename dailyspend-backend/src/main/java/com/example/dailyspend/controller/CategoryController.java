package com.example.dailyspend.controller;

import com.example.dailyspend.dto.CategoryRequest;
import com.example.dailyspend.dto.CategoryResponse;
import com.example.dailyspend.entity.Category;
import com.example.dailyspend.service.CategoryService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // -------- READ (GLOBAL + USER) --------

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        List<CategoryResponse> response = categoryService.findAll()
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        Category category = categoryService.findById(id);
        return ResponseEntity.ok(toResponse(category));
    }

    // -------- CREATE (USER ONLY) --------

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryRequest request) {

        Category created = categoryService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(created));
    }

    // -------- UPDATE (USER ONLY) --------

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {

        Category updated = categoryService.update(id, request);
        return ResponseEntity.ok(toResponse(updated));
    }

    // -------- DELETE (USER ONLY) --------

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // -------- MAPPER --------

    private CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setType(category.getType());

        // Global = user_id is NULL
        response.setGlobal(category.getUser() == null);

        return response;
    }
}
