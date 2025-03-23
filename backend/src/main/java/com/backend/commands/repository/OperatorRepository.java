package com.backend.commands.repository;

import com.backend.commands.model.Operator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OperatorRepository extends JpaRepository<Operator, Integer> {
    Optional<Operator> findByUsername(String username);
}
