package com.spacecraft.spacecraft.service;

import com.fasterxml.jackson.core.JsonProcessingException;
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
        // Ensure timestamps
        Command command1 = new Command();
        UUID spacecraftId = commandRequest.getSpacecraft();
        Spacecraft spacecraft = spacecraftRepo.findById(spacecraftId)
                .orElseThrow(() -> new EntityNotFoundException("Spacecraft not found: " + spacecraftId));

        command1.setSpacecraft(spacecraft);
        command1.setCommandType(commandRequest.getCommandType());
        command1.setOperatorId(commandRequest.getOperatorId());
        command1.setCreatedAt(new Date());
        command1.setStatus(false);
        ObjectMapper objectMapper = new ObjectMapper();
        String jsonPayload = objectMapper.writeValueAsString(commandRequest.getPayload());
        command1.setPayload(jsonPayload);
        return repo.save(command1);
    }

    /** Create a new Command */
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

            // Convert payload to JSON string if it's not already a string
            String payloadJson;
            if (request.getPayload() instanceof String) {
                payloadJson = (String) request.getPayload();
            } else {
                // Serialize the payload object to JSON
                try {
                    payloadJson = objectMapper.writeValueAsString(request.getPayload());
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
}