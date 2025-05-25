package com.spacecraft.spacecraft.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.spacecraft.spacecraft.model.Spacecraft;
import com.spacecraft.spacecraft.model.SpacecraftType;

@DataJpaTest
@ActiveProfiles("test")
class SpacecraftRepositoryTest {

    @Autowired
    private SpacecraftRepository spacecraftRepository;

    private UUID testEnterpriseId;
    private UUID testMissionId;

    @BeforeEach
    void setUp() {
        testEnterpriseId = UUID.randomUUID();
        testMissionId = UUID.randomUUID();
    }

    @Test
    void testSaveAndFindById() {
        Spacecraft spacecraft = createTestSpacecraft(12345L, "Test Satellite", SpacecraftType.SATELLITE);
        
        Spacecraft saved = spacecraftRepository.save(spacecraft);
        assertNotNull(saved.getId());
        
        Optional<Spacecraft> found = spacecraftRepository.findById(saved.getId());
        assertTrue(found.isPresent());
        assertEquals("Test Satellite", found.get().getExternalName());
    }

    @Test
    void testFindByExternalId() {
        Spacecraft spacecraft = createTestSpacecraft(12345L, "Test Satellite", SpacecraftType.SATELLITE);
        spacecraftRepository.save(spacecraft);
        
        Spacecraft found = spacecraftRepository.findByExternalId(12345L);
        assertNotNull(found);
        assertEquals(12345L, found.getExternalId());
    }

    @Test
    void testFindByExternalIdAndEnterpriseId() {
        Spacecraft spacecraft = createTestSpacecraft(12345L, "Test Satellite", SpacecraftType.SATELLITE);
        spacecraftRepository.save(spacecraft);
        
        Optional<Spacecraft> found = spacecraftRepository.findByExternalIdAndEnterpriseId(12345L, testEnterpriseId);
        assertTrue(found.isPresent());
        assertEquals(12345L, found.get().getExternalId());
        assertEquals(testEnterpriseId, found.get().getEnterpriseId());
    }

    @Test
    void testFindByMissionId() {
        Spacecraft spacecraft1 = createTestSpacecraft(12345L, "Satellite 1", SpacecraftType.SATELLITE);
        Spacecraft spacecraft2 = createTestSpacecraft(54321L, "Satellite 2", SpacecraftType.ROVER);
        
        spacecraftRepository.save(spacecraft1);
        spacecraftRepository.save(spacecraft2);
        
        List<Spacecraft> found = spacecraftRepository.findByMissionId(testMissionId);
        assertEquals(2, found.size());
    }

    @Test
    void testFindByType() {
        Spacecraft satellite = createTestSpacecraft(12345L, "Test Satellite", SpacecraftType.SATELLITE);
        Spacecraft rover = createTestSpacecraft(54321L, "Test Rover", SpacecraftType.ROVER);
        
        spacecraftRepository.save(satellite);
        spacecraftRepository.save(rover);
        
        List<Spacecraft> satellites = spacecraftRepository.findByType(SpacecraftType.SATELLITE);
        List<Spacecraft> rovers = spacecraftRepository.findByType(SpacecraftType.ROVER);
        
        assertEquals(1, satellites.size());
        assertEquals(1, rovers.size());
        assertEquals(SpacecraftType.SATELLITE, satellites.get(0).getType());
        assertEquals(SpacecraftType.ROVER, rovers.get(0).getType());
    }

    @Test
    void testFindByEnterpriseId() {
        Spacecraft spacecraft1 = createTestSpacecraft(12345L, "Satellite 1", SpacecraftType.SATELLITE);
        Spacecraft spacecraft2 = createTestSpacecraft(54321L, "Satellite 2", SpacecraftType.ROVER);
        
        spacecraftRepository.save(spacecraft1);
        spacecraftRepository.save(spacecraft2);
        
        List<Spacecraft> found = spacecraftRepository.findByEnterpriseId(testEnterpriseId);
        assertEquals(2, found.size());
    }

    @Test
    void testCountByEnterpriseId() {
        Spacecraft spacecraft1 = createTestSpacecraft(12345L, "Satellite 1", SpacecraftType.SATELLITE);
        Spacecraft spacecraft2 = createTestSpacecraft(54321L, "Satellite 2", SpacecraftType.ROVER);
        
        spacecraftRepository.save(spacecraft1);
        spacecraftRepository.save(spacecraft2);
        
        long count = spacecraftRepository.countByEnterpriseId(testEnterpriseId);
        assertEquals(2, count);
    }

    @Test
    void testCountByTypeAndEnterpriseId() {
        Spacecraft satellite1 = createTestSpacecraft(12345L, "Satellite 1", SpacecraftType.SATELLITE);
        Spacecraft satellite2 = createTestSpacecraft(23456L, "Satellite 2", SpacecraftType.SATELLITE);
        Spacecraft rover = createTestSpacecraft(54321L, "Rover 1", SpacecraftType.ROVER);
        
        spacecraftRepository.save(satellite1);
        spacecraftRepository.save(satellite2);
        spacecraftRepository.save(rover);
        
        Map<String, Long> counts = spacecraftRepository.countByTypeAndEnterpriseId(testEnterpriseId);
        assertEquals(2L, counts.get("SATELLITE"));
        assertEquals(1L, counts.get("ROVER"));
    }

    @Test
    void testCountByMissionIdIn() {
        UUID mission1 = UUID.randomUUID();
        UUID mission2 = UUID.randomUUID();
        
        Spacecraft spacecraft1 = createTestSpacecraft(12345L, "Satellite 1", SpacecraftType.SATELLITE);
        spacecraft1.setMissionId(mission1);
        
        Spacecraft spacecraft2 = createTestSpacecraft(54321L, "Satellite 2", SpacecraftType.ROVER);
        spacecraft2.setMissionId(mission2);
        
        spacecraftRepository.save(spacecraft1);
        spacecraftRepository.save(spacecraft2);
        
        long count = spacecraftRepository.countByMissionIdIn(List.of(mission1, mission2));
        assertEquals(2, count);
    }

    private Spacecraft createTestSpacecraft(Long externalId, String name, SpacecraftType type) {
        Spacecraft spacecraft = new Spacecraft();
        spacecraft.setExternalId(externalId);
        spacecraft.setExternalName(name);
        spacecraft.setDisplayName(name + " Display");
        spacecraft.setType(type);
        spacecraft.setEnterpriseId(testEnterpriseId);
        spacecraft.setMissionId(testMissionId);
        return spacecraft;
    }
} 