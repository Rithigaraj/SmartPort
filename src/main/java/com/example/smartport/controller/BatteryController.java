package com.example.smartport.controller;

import com.example.smartport.entity.Battery;
import com.example.smartport.repository.BatteryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batteries")
@CrossOrigin
public class BatteryController {

    private final BatteryRepository repository;

    public BatteryController(BatteryRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Battery> getAllBatteries() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Battery getBatteryById(@PathVariable Long id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    public Battery addBattery(@RequestBody Battery battery) {
        return repository.save(battery);
    }

    @PutMapping("/{id}")
    public Battery updateBattery(@PathVariable Long id, @RequestBody Battery battery) {
        Battery existing = repository.findById(id).orElseThrow();
        existing.setBatteryNumber(battery.getBatteryNumber());
        existing.setChargePercentage(battery.getChargePercentage());
        existing.setStatus(battery.getStatus());
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteBattery(@PathVariable Long id) {
        repository.deleteById(id);
        return "Battery deleted successfully";
    }
}