package com.example.smartport.controller;

import com.example.smartport.entity.Carrier;
import com.example.smartport.repository.CarrierRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carriers")
@CrossOrigin
public class CarrierController {

    private final CarrierRepository repository;

    public CarrierController(CarrierRepository repository) {
        this.repository = repository;
    }

    // VIEW ALL
    @GetMapping
    public List<Carrier> getAllCarriers() {
        return repository.findAll();
    }

    // ADD
    @PostMapping
    public Carrier addCarrier(@RequestBody Carrier carrier) {
        return repository.save(carrier);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Carrier updateCarrier(
            @PathVariable Long id,
            @RequestBody Carrier carrier) {

        Carrier existing = repository.findById(id)
                .orElseThrow();

        existing.setCarrierNumber(carrier.getCarrierNumber());
        existing.setManufacturer(carrier.getManufacturer());
        existing.setModel(carrier.getModel());
        existing.setBatteryPercentage(
                carrier.getBatteryPercentage()
        );
        existing.setStatus(carrier.getStatus());

        return repository.save(existing);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteCarrier(@PathVariable Long id) {

        repository.deleteById(id);

        return "Carrier deleted successfully";
    }
}