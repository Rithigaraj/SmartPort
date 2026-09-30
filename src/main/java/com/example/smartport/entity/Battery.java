package com.example.smartport.entity;

import jakarta.persistence.*;

@Entity
public class Battery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String batteryNumber;
    private double chargePercentage;
    private String status;

    public Long getId() {
        return id;
    }

    public String getBatteryNumber() {
        return batteryNumber;
    }

    public void setBatteryNumber(String batteryNumber) {
        this.batteryNumber = batteryNumber;
    }

    public double getChargePercentage() {
        return chargePercentage;
    }

    public void setChargePercentage(double chargePercentage) {
        this.chargePercentage = chargePercentage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}