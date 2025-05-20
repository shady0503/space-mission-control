package com.spacecraft.spacecraft.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper;
    private static final Logger logger = LoggerFactory.getLogger(CommandController.class);

    public CommandController(CommandService service, ObjectMapper objectMapper) {
        this.service = service;
        this.objectMapper = objectMapper;
    }

    @PutMapping("/execute/{commandId}")
    public Command execute(@PathVariable UUID commandId) {
        return service.execute(commandId);
    }

    @GetMapping(params = {"externalId", "enterpriseId"})
    List<Command> findCommandsForSpacecraft(@RequestParam("externalId") long externalId, @RequestParam("enterpriseId") UUID enterpriseId){
        return service.findCommandsForSpacecraft(externalId, enterpriseId);
    }


    @PostMapping
    public ResponseEntity<?> create(@RequestBody CommandRequest command) {
        try {
            logger.info("Received command creation request: {}", command);
            Command created = service.create(command);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request parameters: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid request", "message", e.getMessage()));
        } catch (CommandCreationException e) {
            logger.error("Command creation failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Command creation failed", "message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error creating command: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error", "message", "Failed to create command"));
        }
    }

    @GetMapping
    public ResponseEntity<List<Command>> getAll() {
        try {
            List<Command> commands = service.findAll();
            return ResponseEntity.ok(commands);
        } catch (Exception e) {
            logger.error("Error fetching all commands: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable UUID id) {
        try {
            Command command = service.findById(id);
            return ResponseEntity.ok(command);
        } catch (Exception e) {
            logger.error("Error fetching command {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Command not found", "id", id.toString()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody JsonNode requestBody) {
        try {
            // Convert JsonNode to Command entity manually to handle payload properly
            Command cmd = objectMapper.convertValue(requestBody, Command.class);

            // Handle payload specifically if it exists in the request
            if (requestBody.has("payload")) {
                JsonNode payloadNode = requestBody.get("payload");
                String payloadString;
                if (payloadNode.isTextual()) {
                    payloadString = payloadNode.asText();
                } else {
                    payloadString = objectMapper.writeValueAsString(payloadNode);
                }
                cmd.setPayload(payloadString);
            }

            Command updated = service.update(id, cmd);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("Error updating command {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update command", "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting command {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Command not found", "id", id.toString()));
        }
    }

    @GetMapping("/count/type")
    public ResponseEntity<?> countByType() {
        try {
            Map<String, Long> counts = service.countByType();
            return ResponseEntity.ok(counts);
        } catch (Exception e) {
            logger.error("Error counting commands by type: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to count commands by type"));
        }
    }

    @GetMapping("/count/operator")
    public ResponseEntity<?> countByOperator(@RequestParam UUID operatorId) {
        try {
            Map<UUID, Long> counts = service.countByOperator(operatorId);
            return ResponseEntity.ok(counts);
        } catch (Exception e) {
            logger.error("Error counting commands by operator {}: {}", operatorId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to count commands by operator"));
        }
    }

    @GetMapping("/mission/{missionId}")
    public ResponseEntity<?> getByMission(@PathVariable UUID missionId) {
        try {
            List<Command> commands = service.getByMission(missionId);
            return ResponseEntity.ok(commands);
        } catch (Exception e) {
            logger.error("Error fetching commands for mission {}: {}", missionId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch commands for mission"));
        }
    }

    @GetMapping("/count/pending")
    public long countPending(@RequestParam UUID operatorId) {
        return service.countPending(operatorId);
    }

    @GetMapping("/count/successful")
    public long countSuccessful(@RequestParam UUID operatorId) {
        return service.countSuccessful(operatorId);
    }

}