package com.example.smartport.controller;

import com.example.smartport.entity.ContainerMove;
import com.example.smartport.service.ContainerMoveService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/moves")
@CrossOrigin
public class ContainerMoveController {

    private final ContainerMoveService service;

    public ContainerMoveController(ContainerMoveService service) {
        this.service = service;
    }

    @GetMapping
    public List<ContainerMove> getAllMoves() {
        return service.getAllMoves();
    }

    @GetMapping("/{id}")
    public ContainerMove getMoveById(@PathVariable Long id) {
        return service.getMoveById(id);
    }

    @PostMapping
    public ContainerMove addMove(@RequestBody ContainerMove move) {
        return service.processMove(move);
    }

    @PutMapping("/{id}")
    public ContainerMove updateMove(@PathVariable Long id, @RequestBody ContainerMove move) {
        return service.updateMove(id, move);
    }

    @DeleteMapping("/{id}")
    public String deleteMove(@PathVariable Long id) {
        service.deleteMove(id);
        return "Move deleted successfully";
    }
}