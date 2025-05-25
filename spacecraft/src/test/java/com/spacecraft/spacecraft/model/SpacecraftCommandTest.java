package com.spacecraft.spacecraft.model;

import java.util.Date;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class SpacecraftCommandTest {

    @Autowired
    private TestEntityManager entityManager;

    private Spacecraft testSpacecraft;
    private UUID testEnterpriseId;

    @BeforeEach
    void setUp() {
        testEnterpriseId = UUID.randomUUID();

        testSpacecraft = new Spacecraft();
        testSpacecraft.setExternalId(12345L);
        testSpacecraft.setExternalName("Test Satellite");
        testSpacecraft.setDisplayName("Test Display Name");
        testSpacecraft.setType(SpacecraftType.SATELLITE);
        testSpacecraft.setEnterpriseId(testEnterpriseId);
        testSpacecraft.setMissionId(UUID.randomUUID());
    }

    @Test
    void testSpacecraftPersistence() {
        // Save spacecraft
        Spacecraft saved = entityManager.persistAndFlush(testSpacecraft);
        assertNotNull(saved.getId());

        // Retrieve spacecraft
        Spacecraft found = entityManager.find(Spacecraft.class, saved.getId());
        assertNotNull(found);
        assertEquals("Test Satellite", found.getExternalName());
        assertEquals(SpacecraftType.SATELLITE, found.getType());
        assertEquals(testEnterpriseId, found.getEnterpriseId());
    }

    @Test
    void testCommandPersistence() {
        // Save spacecraft first
        Spacecraft savedSpacecraft = entityManager.persistAndFlush(testSpacecraft);

        // Create command
        Command command = new Command();
        command.setSpacecraft(savedSpacecraft);
        command.setCommandType(CommandType.LAUNCH);
        command.setOperatorId(UUID.randomUUID());
        command.setPayload("{\"target\": \"orbit\"}");
        command.setStatus(false);
        command.setCreatedAt(new Date());

        // Save command
        Command savedCommand = entityManager.persistAndFlush(command);
        assertNotNull(savedCommand.getId());

        // Retrieve command
        Command foundCommand = entityManager.find(Command.class, savedCommand.getId());
        assertNotNull(foundCommand);
        assertEquals(CommandType.LAUNCH, foundCommand.getCommandType());
        assertEquals("{\"target\": \"orbit\"}", foundCommand.getPayload());
        assertFalse(foundCommand.getStatus());
        assertNotNull(foundCommand.getSpacecraft());
        assertEquals(savedSpacecraft.getId(), foundCommand.getSpacecraft().getId());
    }

    @Test
    void testSpacecraftCommandRelationship() {
        // Save spacecraft
        Spacecraft savedSpacecraft = entityManager.persistAndFlush(testSpacecraft);

        // Create multiple commands
        Command command1 = createTestCommand(savedSpacecraft, CommandType.LAUNCH, "{\"target\": \"orbit\"}");
        Command command2 = createTestCommand(savedSpacecraft, CommandType.ADJUST_TRAJECTORY, "{\"angle\": 45}");

        entityManager.persistAndFlush(command1);
        entityManager.persistAndFlush(command2);

        // Clear persistence context to force fresh load
        entityManager.clear();

        // Retrieve spacecraft with commands
        Spacecraft foundSpacecraft = entityManager.find(Spacecraft.class, savedSpacecraft.getId());
        assertNotNull(foundSpacecraft);

        // Note: Commands are lazily loaded, so we need to access them to trigger
        // loading
        assertEquals(2, foundSpacecraft.getCommands().size());
    }

    @Test
    void testCommandTypes() {
        Spacecraft savedSpacecraft = entityManager.persistAndFlush(testSpacecraft);

        // Test all command types
        Command launchCommand = createTestCommand(savedSpacecraft, CommandType.LAUNCH, "{}");
        Command trajectoryCommand = createTestCommand(savedSpacecraft, CommandType.ADJUST_TRAJECTORY, "{}");
        Command shutdownCommand = createTestCommand(savedSpacecraft, CommandType.SHUTDOWN, "{}");
        Command emergencyCommand = createTestCommand(savedSpacecraft, CommandType.EMERGENCY_STOP, "{}");

        entityManager.persistAndFlush(launchCommand);
        entityManager.persistAndFlush(trajectoryCommand);
        entityManager.persistAndFlush(shutdownCommand);
        entityManager.persistAndFlush(emergencyCommand);

        // Verify all commands were saved with correct types
        Command foundLaunch = entityManager.find(Command.class, launchCommand.getId());
        Command foundTrajectory = entityManager.find(Command.class, trajectoryCommand.getId());
        Command foundShutdown = entityManager.find(Command.class, shutdownCommand.getId());
        Command foundEmergency = entityManager.find(Command.class, emergencyCommand.getId());

        assertEquals(CommandType.LAUNCH, foundLaunch.getCommandType());
        assertEquals(CommandType.ADJUST_TRAJECTORY, foundTrajectory.getCommandType());
        assertEquals(CommandType.SHUTDOWN, foundShutdown.getCommandType());
        assertEquals(CommandType.EMERGENCY_STOP, foundEmergency.getCommandType());
    }

    @Test
    void testSpacecraftTypes() {
        // Test SATELLITE type
        Spacecraft satellite = new Spacecraft();
        satellite.setExternalId(11111L);
        satellite.setExternalName("Test Satellite");
        satellite.setDisplayName("Satellite Display");
        satellite.setType(SpacecraftType.SATELLITE);
        satellite.setEnterpriseId(testEnterpriseId);

        Spacecraft savedSatellite = entityManager.persistAndFlush(satellite);
        assertEquals(SpacecraftType.SATELLITE, savedSatellite.getType());

        // Test ROVER type
        Spacecraft rover = new Spacecraft();
        rover.setExternalId(22222L);
        rover.setExternalName("Test Rover");
        rover.setDisplayName("Rover Display");
        rover.setType(SpacecraftType.ROVER);
        rover.setEnterpriseId(testEnterpriseId);

        Spacecraft savedRover = entityManager.persistAndFlush(rover);
        assertEquals(SpacecraftType.ROVER, savedRover.getType());
    }

    private Command createTestCommand(Spacecraft spacecraft, CommandType type, String payload) {
        Command command = new Command();
        command.setSpacecraft(spacecraft);
        command.setCommandType(type);
        command.setOperatorId(UUID.randomUUID());
        command.setPayload(payload);
        command.setStatus(false);
        command.setCreatedAt(new Date());
        return command;
    }
}