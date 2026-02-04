package com.example.dailyspend.dto;

import jakarta.validation.constraints.NotBlank;

public class CategoryRequest {

    @NotBlank(message = "Category name must not be blank")
    private String name;

    @NotBlank(message = "Category type must not be blank")
    private String type; // INCOME / EXPENSE

    // getters & setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
}
