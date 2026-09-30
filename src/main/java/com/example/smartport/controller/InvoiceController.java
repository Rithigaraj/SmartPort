package com.example.smartport.controller;

import com.example.smartport.entity.Invoice;
import com.example.smartport.repository.InvoiceRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin
public class InvoiceController {

    private final InvoiceRepository repository;

    public InvoiceController(InvoiceRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Invoice> getAllInvoices() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Invoice getInvoiceById(@PathVariable Long id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    public Invoice addInvoice(@RequestBody Invoice invoice) {
        return repository.save(invoice);
    }

    @PutMapping("/{id}")
    public Invoice updateInvoice(@PathVariable Long id, @RequestBody Invoice invoice) {
        Invoice existing = repository.findById(id).orElseThrow();
        existing.setAmount(invoice.getAmount());
        existing.setStatus(invoice.getStatus());
        if (invoice.getCustomer() != null) {
            existing.setCustomer(invoice.getCustomer());
        }
        if (invoice.getMove() != null) {
            existing.setMove(invoice.getMove());
        }
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteInvoice(@PathVariable Long id) {
        repository.deleteById(id);
        return "Invoice deleted successfully";
    }
}