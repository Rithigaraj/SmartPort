package com.example.smartport.controller;

import com.example.smartport.repository.BudgetRepository;
import com.example.smartport.repository.InvoiceRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class FinancialReportController {

    private final BudgetRepository budgetRepository;
    private final InvoiceRepository invoiceRepository;

    public FinancialReportController(
            BudgetRepository budgetRepository,
            InvoiceRepository invoiceRepository) {

        this.budgetRepository = budgetRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @GetMapping("/budget")
    public Map<String, Object> getBudgetReport() {

        Map<String, Object> report = new HashMap<>();

        double planned = budgetRepository.findAll()
                .stream()
                .mapToDouble(b -> b.getPlannedAmount())
                .sum();

        double actual = budgetRepository.findAll()
                .stream()
                .mapToDouble(b -> b.getActualAmount())
                .sum();

        report.put("plannedBudget", planned);
        report.put("actualBudget", actual);
        report.put("remainingBudget", planned - actual);

        return report;
    }

    @GetMapping("/profit-loss")
    public Map<String, Object> getProfitLoss() {

        Map<String, Object> report = new HashMap<>();

        double revenue = invoiceRepository.findAll()
                .stream()
                .mapToDouble(i -> i.getAmount())
                .sum();

        double expenses = budgetRepository.findAll()
                .stream()
                .mapToDouble(b -> b.getActualAmount())
                .sum();

        double profitOrLoss = revenue - expenses;

        report.put("totalRevenue", revenue);
        report.put("totalExpenses", expenses);
        report.put("profitOrLoss", profitOrLoss);

        return report;
    }
}