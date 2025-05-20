package com.spacecraft.spacecraft.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spacecraft.dto.CommandRequest;
import com.spacecraft.exception.CommandCreationException;
import com.spacecraft.spacecraft.model.Command;
import com.spacecraft.spacecraft.model.Spacecraft;
import com.spacecraft.spacecraft.repository.CommandRepository;
import com.spacecraft.spacecraft.repository.SpacecraftRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommandService {
    private static final Logger logger = LoggerFactory.getLogger(CommandService.class);

    private final CommandRepository repo;
    private final SpacecraftRepository spacecraftRepo;
    private final ObjectMapper objectMapper;

    public CommandService(CommandRepository repo, SpacecraftRepository spacecraftRepo, ObjectMapper objectMapper) {
        this.repo = repo;
        this.spacecraftRepo = spacecraftRepo;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public Command create(CommandRequest commandRequest) throws JsonProcessingException {
        try {
            // Validate required fields
            validateCommandRequest(commandRequest);

            // Find spacecraft by ID
            UUID spacecraftId = commandRequest.getSpacecraft();
            Spacecraft spacecraft = spacecraftRepo.findById(spacecraftId)
                    .orElseThrow(() -> new EntityNotFoundException("Spacecraft not found: " + spacecraftId));

            // Create new command
            Command command = new Command();
            command.setSpacecraft(spacecraft);
            command.setCommandType(commandRequest.getCommandType());
            command.setOperatorId(commandRequest.getOperatorId());
            command.setCreatedAt(new Date());
            command.setStatus(false); // Initial status is false until executed

            // Convert JsonNode to JSON string
            String jsonPayload;
            JsonNode payloadNode = commandRequest.getPayload();
            if (payloadNode == null) {
                jsonPayload = "null";
            } else if (payloadNode.isTextual()) {
                // If it's already a text node, use its text value as JSON string
                jsonPayload = payloadNode.asText();
            } else {
                // Convert JsonNode to JSON string
                jsonPayload = objectMapper.writeValueAsString(payloadNode);
            }

            command.setPayload(jsonPayload);

            logger.info("Creating command for spacecraft {} with type {} and operator {}",
                    spacecraftId, commandRequest.getCommandType(), commandRequest.getOperatorId());

            return repo.save(command);

        } catch (EntityNotFoundException e) {
            logger.error("Spacecraft not found: {}", e.getMessage());
            throw e;
        } catch (JsonProcessingException e) {
            logger.error("Error processing JSON payload: {}", e.getMessage(), e);
            throw new JsonProcessingException("Failed to serialize payload: " + e.getMessage()) {};
        } catch (Exception e) {
            logger.error("Unexpected error creating command: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create command: " + e.getMessage(), e);
        }
    }

    private void validateCommandRequest(CommandRequest request) {
        if (request.getSpacecraft() == null) {
            throw new IllegalArgumentException("Spacecraft ID cannot be null");
        }
        if (request.getCommandType() == null) {
            throw new IllegalArgumentException("Command type cannot be null");
        }
        if (request.getOperatorId() == null) {
            throw new IllegalArgumentException("Operator ID cannot be null");
        }
        // Payload can be null, so we don't validate it here
    }

    /** Create a new Command with enhanced validation and error handling */
    @Transactional
    public Command issueCommand(CommandRequest request) throws CommandCreationException {
        try {
            // Validate request
            if (request.getSpacecraft() == null) {
                throw new CommandCreationException("Spacecraft cannot be null");
            }

            if (request.getCommandType() == null) {
                throw new CommandCreationException("Command type cannot be null");
            }

            if (request.getOperatorId() == null) {
                throw new CommandCreationException("Operator ID cannot be null");
            }

            if (request.getPayload() == null) {
                throw new CommandCreationException("Command payload cannot be null");
            }

            // Find spacecraft by ID
            UUID spacecraftId = request.getSpacecraft();
            Optional<Spacecraft> spacecraftOpt = spacecraftRepo.findById(spacecraftId);
            if (!spacecraftOpt.isPresent()) {
                throw new CommandCreationException("Spacecraft with ID " + spacecraftId + " not found");
            }
            Spacecraft spacecraft = spacecraftOpt.get();

            // Convert JsonNode payload to JSON string
            String payloadJson;
            JsonNode payloadNode = request.getPayload();

            if (payloadNode.isTextual()) {
                // If it's already a text node, use its text value
                payloadJson = payloadNode.asText();
            } else {
                // Serialize the JsonNode to JSON string
                try {
                    payloadJson = objectMapper.writeValueAsString(payloadNode);
                } catch (Exception e) {
                    throw new CommandCreationException("Failed to serialize payload to JSON: " + e.getMessage());
                }
            }

            // Create new command
            Command command = new Command();
            command.setSpacecraft(spacecraft);
            command.setCommandType(request.getCommandType());
            command.setOperatorId(request.getOperatorId());
            command.setPayload(payloadJson);
            command.setStatus(false); // Initial status is false until executed
            command.setCreatedAt(new Date());

            // Save the command
            return repo.save(command);

        } catch (CommandCreationException e) {
            // Re-throw the specific exception
            throw e;
        } catch (Exception e) {
            // Log the error and wrap in our custom exception
            logger.error("Error creating command: {}", e.getMessage(), e);
            throw new CommandCreationException("Failed to create command: " + e.getMessage(), e);
        }
    }

    /** Fetch all Commands */
    @Transactional(readOnly = true)
    public List<Command> findAll() {
        return repo.findAll();
    }

    /** Fetch a single Command by its UUID */
    @Transactional(readOnly = true)
    public Command findById(UUID id) {
        return repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Command not found: " + id));
    }

    /** Fetch all Commands for a given spacecraft */
    @Transactional(readOnly = true)
    public List<Command> findBySpacecraft(UUID spacecraftId) {
        return repo.findBySpacecraftId(spacecraftId);
    }

    /** Update an existing Command */
    public Command update(UUID id, Command dto) {
        Command existing = findById(id);
        existing.setCommandType(dto.getCommandType());
        existing.setPayload(dto.getPayload());
        existing.setStatus(dto.getStatus());
        existing.setExecutedAt(dto.getExecutedAt());
        // do not overwrite createdAt or spacecraftId
        return repo.save(existing);
    }

    /** Delete a Command */
    public void delete(UUID id) {
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Command not found: " + id);
        }
        repo.deleteById(id);
    }

    public long countPending(UUID operatorId) {
        return repo.countByOperatorIdAndStatus(operatorId, false);
    }

    public long countSuccessful(UUID operatorId) {
        return repo.countByOperatorIdAndStatus(operatorId, true);
    }

    public Map<String, Long> countByType() {
        return repo.findAll().stream()
                .collect(Collectors.groupingBy(cmd -> cmd.getStatus().toString(), Collectors.counting()));
    }

    public Map<UUID, Long> countByOperator(UUID operatorId) {
        return repo.findAllByOperatorId(operatorId).stream()
                .collect(Collectors.groupingBy(Command::getOperatorId, Collectors.counting()));
    }

    public List<Command> getByMission(UUID missionId) {
        return spacecraftRepo.findByMissionId(missionId).stream()
                .flatMap(s -> s.getCommands().stream())
                .collect(Collectors.toList());
    }

    public Command execute(UUID commandId) {
        Command command = repo.findById(commandId).orElseThrow(() -> new EntityNotFoundException("Command not found: " + commandId));
        command.setStatus(true);
        command.setExecutedAt(new Date());
        return repo.save(command);

    }

    public List<Command> findCommandsForSpacecraft(long externalId, UUID enterpriseId) {
        List<Spacecraft> matchingSpacecrafts = spacecraftRepo.findAllByExternalId(externalId);

        return matchingSpacecrafts.stream()
                .filter(s -> enterpriseId.equals(s.getEnterpriseId()))
                .flatMap(s -> repo.findBySpacecraftId(s.getId()).stream())
                .toList();
    }

}