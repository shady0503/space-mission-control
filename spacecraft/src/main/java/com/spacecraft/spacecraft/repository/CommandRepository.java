// src/main/java/com/spacecraft/spacecraft/repo/CommandRepository.java
package com.spacecraft.spacecraft.repository;

import com.spacecraft.spacecraft.model.Command;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommandRepository extends JpaRepository<Command, UUID> {
    List<Command> findBySpacecraftId(UUID spacecraftId);

    long countByOperatorIdAndStatus(UUID operatorId, Boolean status);
    List<Command> findAllByOperatorId(UUID operatorId);}
