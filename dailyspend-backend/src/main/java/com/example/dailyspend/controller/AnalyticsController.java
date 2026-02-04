package com.example.dailyspend.controller;

import com.example.dailyspend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/income")
    public ResponseEntity<BigDecimal> totalIncome() {
        return ResponseEntity.ok(analyticsService.getTotalIncome());
    }

    @GetMapping("/expense")
    public ResponseEntity<BigDecimal> totalExpense() {
        return ResponseEntity.ok(analyticsService.getTotalExpense());
    }

    @GetMapping("/net")
    public ResponseEntity<BigDecimal> netBalance() {
        return ResponseEntity.ok(analyticsService.getNetBalance());
    }
}
