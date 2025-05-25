package com.spacecraft.spacecraft.service;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import com.spacecraft.spacecraft.model.Spacecraft;
import com.spacecraft.spacecraft.model.SpacecraftType;
import com.spacecraft.spacecraft.repository.SpacecraftRepository;

import jakarta.persistence.EntityNotFoundException;

@DataJpaTest
@ActiveProfiles("test")
@Import(SpacecraftService.class)
class SpacecraftServiceTest {

    @Autowired
    private SpacecraftService spacecraftService;

    @Autowired
    private SpacecraftRepository spacecraftRepository;

    private Spacecraft testSpacecraft;
    private UUID testEnterpriseId;
    private UUID testMissionId;

    @BeforeEach
    void setUp() {
        testEnterpriseId = UUID.randomUUID();
        testMissionId = UUID.randomUUID();

        testSpacecraft = new Spacecraft();
        testSpacecraft.setExternalId(12345L);
        testSpacecraft.setExternalName("Test Satellite");
        testSpacecraft.setDisplayName("Test Display Name");
        testSpacecraft.setType(SpacecraftType.SATELLITE);
        testSpacecraft.setEnterpriseId(testEnterpriseId);
        testSpacecraft.setMissionId(testMissionId);
    }

    @Test
    void testSaveAndGetById() {
        // Save spacecraft
        Spacecraft saved = spacecraftService.save(testSpacecraft);
        assertNotNull(saved.getId());

        // Retrieve by ID
        Spacecraft retrieved = spacecraftService.getById(saved.getId());
        assertEquals(saved.getId(), retrieved.getId());
        assertEquals("Test Satellite", retrieved.getExternalName());
        assertEquals(SpacecraftType.SATELLITE, retrieved.getType());
    }

    @Test
    void testGetByExternalId() {
        // Save spacecraft
        spacecraftService.save(testSpacecraft);

        // Retrieve by external ID
        Spacecraft retrieved = spacecraftService.getByExternalId(12345L, testEnterpriseId);
        assertEquals(12345L, retrieved.getExternalId());
        assertEquals(testEnterpriseId, retrieved.getEnterpriseId());
    }

    @Test
    void testGetByExternalIdNotFound() {
        assertThrows(EntityNotFoundException.class, () -> {
            spacecraftService.getByExternalId(99999L, testEnterpriseId);
        });
    }

    @Test
    void testGetByMissionId() {
        // Save spacecraft
        spacecraftService.save(testSpacecraft);

        // Retrieve by mission ID
        List<Spacecraft> spacecrafts = spacecraftService.getByMissionId(testMissionId);
        assertEquals(1, spacecrafts.size());
        assertEquals(testMissionId, spacecrafts.get(0).getMissionId());
    }

    @Test
    void testGetByType() {
        // Save spacecraft
        spacecraftService.save(testSpacecraft);

        // Create another spacecraft of different type
        Spacecraft rover = new Spacecraft();
        rover.setExternalId(54321L);
        rover.setExternalName("Test Rover");
        rover.setDisplayName("Test Rover Display");
        rover.setType(SpacecraftType.ROVER);
        rover.setEnterpriseId(testEnterpriseId);
        spacecraftService.save(rover);

        // Test getting by type
        List<Spacecraft> satellites = spacecraftService.getByType(SpacecraftType.SATELLITE);
        List<Spacecraft> rovers = spacecraftService.getByType(SpacecraftType.ROVER);

        assertEquals(1, satellites.size());
        assertEquals(1, rovers.size());
        assertEquals(SpacecraftType.SATELLITE, satellites.get(0).getType());
        assertEquals(SpacecraftType.ROVER, rovers.get(0).getType());
    }

    @Test
    void testGetByEnterpriseId() {
        // Save spacecraft
        spacecraftService.save(testSpacecraft);

        // Retrieve by enterprise ID
        List<Spacecraft> spacecrafts = spacecraftService.getByEnterpriseId(testEnterpriseId);
        assertEquals(1, spacecrafts.size());
        assertEquals(testEnterpriseId, spacecrafts.get(0).getEnterpriseId());
    }

    @Test
    void testDeleteById() {
        // Save spacecraft
        Spacecraft saved = spacecraftService.save(testSpacecraft);
        UUID savedId = saved.getId();

        // Verify it exists
        assertNotNull(spacecraftService.getById(savedId));

        // Delete it
        spacecraftService.deleteById(savedId);

        // Verify it's gone
        assertThrows(EntityNotFoundException.class, () -> {
            spacecraftService.getById(savedId);
        });
    }

    @Test
    void testDeleteByIdNotFound() {
        UUID nonExistentId = UUID.randomUUID();
        assertThrows(EntityNotFoundException.class, () -> {
            spacecraftService.deleteById(nonExistentId);
        });
    }

    @Test
    void testCountByEnterpriseId() {
        // Save multiple spacecraft for same enterprise
        spacecraftService.save(testSpacecraft);

        Spacecraft spacecraft2 = new Spacecraft();
        spacecraft2.setExternalId(67890L);
        spacecraft2.setExternalName("Test Satellite 2");
        spacecraft2.setDisplayName("Test Display Name 2");
        spacecraft2.setType(SpacecraftType.ROVER);
        spacecraft2.setEnterpriseId(testEnterpriseId);
        spacecraftService.save(spacecraft2);

        long count = spacecraftService.countByEnterpriseId(testEnterpriseId);
        assertEquals(2, count);
    }

    @Test
    void testGetAll() {
        // Initially empty
        List<Spacecraft> all = spacecraftService.getAll();
        assertEquals(0, all.size());

        // Save spacecraft
        spacecraftService.save(testSpacecraft);

        // Should have one
        all = spacecraftService.getAll();
        assertEquals(1, all.size());
    }
}