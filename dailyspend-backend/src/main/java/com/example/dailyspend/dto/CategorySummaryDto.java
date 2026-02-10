package com.example.dailyspend.dto;

import java.math.BigDecimal;

public class CategorySummaryDto {

    private Long categoryId;
    private String categoryName;
    private BigDecimal totalAmount;
    private long transactionCount;
    private BigDecimal percentage;

    // ===== Constructors =====

    public CategorySummaryDto() {
    }

    public CategorySummaryDto(
            Long categoryId,
            String categoryName,
            BigDecimal totalAmount,
            long transactionCount) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.totalAmount = totalAmount;
        this.transactionCount = transactionCount;
    }

    // ===== Getters & Setters =====

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public long getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(long transactionCount) {
        this.transactionCount = transactionCount;
    }

    public BigDecimal getPercentage() {
        return percentage;
    }

    public void setPercentage(BigDecimal percentage) {
        this.percentage = percentage;
    }
}