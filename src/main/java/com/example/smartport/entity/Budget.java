package com.example.smartport.entity;

import jakarta.persistence.*;

@Entity
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sector;
    private double plannedAmount;
    private double actualAmount;

    public Long getId() {
        return id;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public double getPlannedAmount() {
        return plannedAmount;
    }

    public void setPlannedAmount(double plannedAmount) {
        this.plannedAmount = plannedAmount;
    }

    public double getActualAmount() {
        return actualAmount;
    }

    public void setActualAmount(double actualAmount) {
        this.actualAmount = actualAmount;
    }

    public double getRemainingAmount() {
        return plannedAmount - actualAmount;
    }
}