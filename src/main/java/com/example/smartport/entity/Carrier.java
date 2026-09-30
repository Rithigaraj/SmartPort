package com.example.smartport.entity;

import jakarta.persistence.*;

@Entity
public class Carrier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String carrierNumber;
    private String manufacturer;
    private String model;
    private double batteryPercentage;
    private String status;

    public Long getId() {
        return id;
    }

    public String getCarrierNumber() {
        return carrierNumber;
    }

    public void setCarrierNumber(String carrierNumber) {
        this.carrierNumber = carrierNumber;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public double getBatteryPercentage() {
        return batteryPercentage;
    }

    public void setBatteryPercentage(double batteryPercentage) {
        this.batteryPercentage = batteryPercentage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}