package com.example.smartport.controller;

import com.example.smartport.entity.Payment;
import com.example.smartport.repository.PaymentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin
public class PaymentController {

    private final PaymentRepository repository;

    public PaymentController(PaymentRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Payment> getAllPayments() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Payment getPaymentById(@PathVariable Long id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    public Payment addPayment(@RequestBody Payment payment) {
        return repository.save(payment);
    }

    @PutMapping("/{id}")
    public Payment updatePayment(@PathVariable Long id, @RequestBody Payment payment) {
        Payment existing = repository.findById(id).orElseThrow();
        existing.setAmount(payment.getAmount());
        existing.setMethod(payment.getMethod());
        existing.setPaymentDate(payment.getPaymentDate());
        if (payment.getInvoice() != null) {
            existing.setInvoice(payment.getInvoice());
        }
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deletePayment(@PathVariable Long id) {
        repository.deleteById(id);
        return "Payment deleted successfully";
    }
}