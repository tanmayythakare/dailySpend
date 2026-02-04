package com.example.dailyspend.service;

import com.example.dailyspend.dto.CategoryRequest;
import com.example.dailyspend.entity.Category;
import com.example.dailyspend.exception.ResourceNotFoundException;
import com.example.dailyspend.repository.CategoryRepository;
import com.example.dailyspend.util.CategoryMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    public Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));
    }

    public Category create(CategoryRequest request) {
        Category category = CategoryMapper.toEntity(request);
        return categoryRepository.save(category);
    }

    public Category update(Long id, CategoryRequest request) {
        Category category = findById(id);
        category.setName(request.getName());
        category.setType(request.getType());
        return categoryRepository.save(category);
    }

    public void delete(Long id) {
        Category category = findById(id);
        categoryRepository.delete(category);
    }
}
