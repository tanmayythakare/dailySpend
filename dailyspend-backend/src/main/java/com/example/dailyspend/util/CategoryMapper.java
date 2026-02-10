package com.example.dailyspend.util;

import com.example.dailyspend.dto.CategoryRequest;
import com.example.dailyspend.dto.CategoryResponse;
import com.example.dailyspend.entity.Category;

public class CategoryMapper {

    public static Category toEntity(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setType(request.getType());
        return category;
    }

    public static CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setType(category.getType());
        return response;
    }
}
