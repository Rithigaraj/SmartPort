package com.example.smartport.service;

import com.example.smartport.entity.Battery;
import com.example.smartport.entity.Carrier;
import com.example.smartport.entity.ContainerMove;
import com.example.smartport.repository.BatteryRepository;
import com.example.smartport.repository.CarrierRepository;
import com.example.smartport.repository.ContainerMoveRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContainerMoveService {

    private final ContainerMoveRepository moveRepository;
    private final CarrierRepository carrierRepository;
    private final BatteryRepository batteryRepository;

    public ContainerMoveService(
            ContainerMoveRepository moveRepository,
            CarrierRepository carrierRepository,
            BatteryRepository batteryRepository) {

        this.moveRepository = moveRepository;
        this.carrierRepository = carrierRepository;
        this.batteryRepository = batteryRepository;
    }

    public ContainerMove processMove(ContainerMove move) {

        Carrier carrier = move.getCarrier();

        if (carrier.getBatteryPercentage() < 15) {

            Battery battery = batteryRepository.findAll()
                    .stream()
                    .filter(b -> b.getChargePercentage() >= 80)
                    .filter(b -> b.getStatus().equalsIgnoreCase("AVAILABLE"))
                    .findFirst()
                    .orElse(null);

            if (battery == null) {
                move.setStatus("WAITING_FOR_BATTERY");
                return moveRepository.save(move);
            }

            // Battery swap
            carrier.setBatteryPercentage(battery.getChargePercentage());
            carrier.setStatus("AVAILABLE");

            battery.setStatus("IN_USE");

            carrierRepository.save(carrier);
            batteryRepository.save(battery);

            move.setStatus("BATTERY_SWAPPED");
        }

        // Complete move
        move.setStatus("COMPLETED");

        return moveRepository.save(move);
    }

    public ContainerMove getMoveById(Long id) {
        return moveRepository.findById(id).orElseThrow();
    }

    public ContainerMove updateMove(Long id, ContainerMove moveDetails) {
        ContainerMove existing = moveRepository.findById(id).orElseThrow();
        existing.setContainerNumber(moveDetails.getContainerNumber());
        existing.setSource(moveDetails.getSource());
        existing.setDestination(moveDetails.getDestination());
        existing.setAmount(moveDetails.getAmount());
        existing.setStatus(moveDetails.getStatus());
        if (moveDetails.getCarrier() != null && moveDetails.getCarrier().getId() != null) {
            Carrier carrier = carrierRepository.findById(moveDetails.getCarrier().getId()).orElse(null);
            existing.setCarrier(carrier);
        }
        return moveRepository.save(existing);
    }

    public void deleteMove(Long id) {
        moveRepository.deleteById(id);
    }

    public List<ContainerMove> getAllMoves() {
        return moveRepository.findAll();
    }
}