package com.example.smartport.controller;

import com.example.smartport.repository.*;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final CarrierRepository carrierRepository;
    private final ContainerMoveRepository moveRepository;
    private final InvoiceRepository invoiceRepository;
    private final BudgetRepository budgetRepository;

    public DashboardController(
            CarrierRepository carrierRepository,
            ContainerMoveRepository moveRepository,
            InvoiceRepository invoiceRepository,
            BudgetRepository budgetRepository) {

        this.carrierRepository = carrierRepository;
        this.moveRepository = moveRepository;
        this.invoiceRepository = invoiceRepository;
        this.budgetRepository = budgetRepository;
    }

    @GetMapping
    public Map<String, Object> dashboard() {

        Map<String, Object> data = new HashMap<>();

        long totalCarriers = carrierRepository.count();

        long availableCarriers =
                carrierRepository.findAll()
                        .stream()
                        .filter(c -> "AVAILABLE"
                                .equalsIgnoreCase(c.getStatus()))
                        .count();

        long lowBattery =
                carrierRepository.findAll()
                        .stream()
                        .filter(c -> c.getBatteryPercentage() < 15)
                        .count();

        long totalMoves = moveRepository.count();

        long completedMoves =
                moveRepository.findAll()
                        .stream()
                        .filter(m -> "COMPLETED"
                                .equalsIgnoreCase(m.getStatus()))
                        .count();

        double revenue =
                invoiceRepository.findAll()
                        .stream()
                        .mapToDouble(i -> i.getAmount())
                        .sum();

        double planned =
                budgetRepository.findAll()
                        .stream()
                        .mapToDouble(b -> b.getPlannedAmount())
                        .sum();

        double actual =
                budgetRepository.findAll()
                        .stream()
                        .mapToDouble(b -> b.getActualAmount())
                        .sum();

        data.put("totalCarriers", totalCarriers);
        data.put("availableCarriers", availableCarriers);
        data.put("lowBatteryCarriers", lowBattery);

        data.put("totalMoves", totalMoves);
        data.put("completedMoves", completedMoves);

        data.put("totalRevenue", revenue);

        data.put("plannedBudget", planned);
        data.put("actualBudget", actual);
        data.put("remainingBudget", planned - actual);

        return data;
    }
}