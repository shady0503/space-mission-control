package com.backend.commands.service;

import com.backend.auth.dto.SignupRequest;
import com.backend.commands.model.Operator;
import com.backend.commands.model.Role;
import com.backend.commands.repository.OperatorRepository;
import com.backend.utils.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.Optional;
@Service
public class OperatorService {

    private final OperatorRepository operatorRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public OperatorService(OperatorRepository operatorRepository, JwtUtil jwtUtil) {
        this.operatorRepository = operatorRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // Registers a new operator and assigns role based on the request (defaults to VIEWER)
    public Operator registerOperator(SignupRequest request) {
        if (operatorRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        Operator operator = new Operator();
        operator.setUsername(request.getUsername());
        operator.setEmail(request.getEmail());
        operator.setHashedPassword(passwordEncoder.encode(request.getPassword()));

        // If a role is provided and is non-empty, assign it; otherwise default to VIEWER
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            operator.setRole(Role.valueOf(request.getRole().toUpperCase()));
        } else {
            operator.setRole(Role.VIEWER);
        }

        operator.setCreatedAt(new Date());
        return operatorRepository.save(operator);
    }

    // Authenticates an operator and returns a JWT token.
    public String authenticateOperator(String username, String rawPassword) {
        Optional<Operator> operatorOpt = operatorRepository.findByUsername(username);
        if (operatorOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        Operator operator = operatorOpt.get();
        if (!passwordEncoder.matches(rawPassword, operator.getHashedPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        return jwtUtil.generateToken(operator);
    }

    public Operator findOperatorByUsername(String username) {
        return operatorRepository.findByUsername(username).orElse(null);
    }

    // Updates the operator's role (for app admin endpoints)
    public void updateRole(String username, String roleStr) {
        Optional<Operator> operatorOpt = operatorRepository.findByUsername(username);
        if (operatorOpt.isPresent()) {
            Operator operator = operatorOpt.get();
            Role newRole = Role.valueOf(roleStr.toUpperCase());
            if (operator.getRole() != newRole) {
                operator.setRole(newRole);
                operatorRepository.save(operator);
            }
        }
    }
}