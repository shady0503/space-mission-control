package com.backend.spacecraft.repository;

import com.backend.spacecraft.model.Spacecraft; import org.springframework.data.jpa.repository.JpaRepository;

public interface SpacecraftRepository extends JpaRepository<Spacecraft, Long> { Spacecraft findBySpacecraftId(Long spacecraftId); }