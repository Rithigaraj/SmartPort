package com.example.smartport.controller;

import com.example.smartport.entity.Budget;
import com.example.smartport.repository.BudgetRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin
public class BudgetController {

    private final BudgetRepository repository;

    public BudgetController(BudgetRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Budget> getAllBudgets() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Budget getBudgetById(@PathVariable Long id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    public Budget addBudget(@RequestBody Budget budget) {
        return repository.save(budget);
    }

    @PutMapping("/{id}")
    public Budget updateBudget(@PathVariable Long id, @RequestBody Budget budget) {
        Budget existing = repository.findById(id).orElseThrow();
        existing.setSector(budget.getSector());
        existing.setPlannedAmount(budget.getPlannedAmount());
        existing.setActualAmount(budget.getActualAmount());
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteBudget(@PathVariable Long id) {
        repository.deleteById(id);
        return "Budget deleted successfully";
    }
}