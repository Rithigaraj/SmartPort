package com.example.smartport.controller;

import com.example.smartport.entity.Customer;
import com.example.smartport.repository.CustomerRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin
public class CustomerController {

    private final CustomerRepository repository;

    public CustomerController(CustomerRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Customer> getAllCustomers() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Customer getCustomerById(@PathVariable Long id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    public Customer addCustomer(@RequestBody Customer customer) {
        return repository.save(customer);
    }

    @PutMapping("/{id}")
    public Customer updateCustomer(@PathVariable Long id, @RequestBody Customer customer) {
        Customer existing = repository.findById(id).orElseThrow();
        existing.setCompanyName(customer.getCompanyName());
        existing.setContact(customer.getContact());
        existing.setEmail(customer.getEmail());
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteCustomer(@PathVariable Long id) {
        repository.deleteById(id);
        return "Customer deleted successfully";
    }
}