package com.backend.unit;

import com.backend.auth.dto.SignupRequest;
import com.backend.commands.model.Operator;
import com.backend.commands.model.Role;
import com.backend.commands.repository.OperatorRepository;
import com.backend.commands.service.OperatorService;
import com.backend.utils.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import static org.mockito.Mockito.*;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;

public class OperatorServiceTest {

    private OperatorRepository operatorRepository;
    private JwtUtil jwtUtil;
    private OperatorService operatorService;

    @BeforeEach
    public void setup() {
        operatorRepository = Mockito.mock(OperatorRepository.class);
        jwtUtil = Mockito.mock(JwtUtil.class);
        operatorService = new OperatorService(operatorRepository, jwtUtil);
    }

    @Test
    public void testRegisterOperatorWithRole() {
        SignupRequest request = new SignupRequest();
        request.setUsername("john");
        request.setEmail("john@example.com");
        request.setPassword("password123");
        request.setRole("ADMIN");

        when(operatorRepository.findByUsername("john")).thenReturn(Optional.empty());
        Operator savedOperator = new Operator();
        savedOperator.setUsername("john");
        savedOperator.setEmail("john@example.com");
        savedOperator.setRole(Role.ADMIN);
        when(operatorRepository.save(any(Operator.class))).thenReturn(savedOperator);

        Operator result = operatorService.registerOperator(request);
        assertNotNull(result);
        assertEquals("john", result.getUsername());
        assertEquals(Role.ADMIN, result.getRole());
    }

    @Test
    public void testAuthenticateOperator() {
        SignupRequest request = new SignupRequest();
        request.setUsername("jane");
        request.setEmail("jane@example.com");
        request.setPassword("secret");
        request.setRole("VIEWER");

        // Create an operator with a hashed password (using real encoder)
        Operator operator = new Operator();
        operator.setUsername("jane");
        operator.setEmail("jane@example.com");
        operator.setRole(Role.VIEWER);
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        operator.setHashedPassword(encoder.encode("secret"));

        when(operatorRepository.findByUsername("jane")).thenReturn(Optional.of(operator));
        when(jwtUtil.generateToken(any(Operator.class))).thenReturn("dummyToken");

        String token = operatorService.authenticateOperator("jane", "secret");
        assertEquals("dummyToken", token);
    }
}
