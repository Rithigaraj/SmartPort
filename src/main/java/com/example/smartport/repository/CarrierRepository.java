package com.example.smartport.repository;

import com.example.smartport.entity.Carrier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarrierRepository extends JpaRepository<Carrier, Long> {
}