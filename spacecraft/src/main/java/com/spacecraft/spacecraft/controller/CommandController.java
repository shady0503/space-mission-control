package com.spacecraft.spacecraft.controller;

import com.spacecraft.dto.CommandRequest;
import com.spacecraft.exception.CommandCreationException;
import com.spacecraft.spacecraft.model.Command;
import com.spacecraft.spacecraft.service.CommandService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/commands")
public class CommandController {

    private final CommandService service;

    private static final Logger logger = LoggerFactory.getLogger(CommandController.class);


    public CommandController(CommandService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CommandRequest command) {
        try {
            Command created = service.create(command);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            logger.error("Error creating command: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create command: " + e.getMessage());
        }
    }



    @GetMapping
    public List<Command> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Command getOne(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
    public Command update(@PathVariable UUID id, @RequestBody Command cmd) {
        return service.update(id, cmd);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    @GetMapping("/count/pending")
    public long countPending(@RequestParam UUID operatorId) {
        return service.countPending(operatorId);
    }

    @GetMapping("/count/successful")
    public long countSuccessful(@RequestParam UUID operatorId) {
        return service.countSuccessful(operatorId);
    }

    @GetMapping("/count/type")
    public Map<String, Long> countByType() {
        return service.countByType();
    }

    @GetMapping("/count/operator")
    public Map<UUID, Long> countByOperator(@RequestParam UUID operatorId) {
        return service.countByOperator(operatorId);
    }

    @GetMapping("/mission/{missionId}")
    public List<Command> getByMission(@PathVariable UUID missionId) {
        return service.getByMission(missionId);
    }
}
