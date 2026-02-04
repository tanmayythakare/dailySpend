package com.example.dailyspend.dto;

import jakarta.validation.constraints.NotBlank;

public class PersonRequest {

    @NotBlank
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
