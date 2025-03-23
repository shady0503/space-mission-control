package com.backend.auth.controller;


import com.backend.auth.dto.AuthResponse;
import com.backend.auth.dto.LoginRequest;
import com.backend.auth.dto.SignupRequest;
import com.backend.commands.model.Operator;
import com.backend.commands.service.OperatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final OperatorService operatorService;

    public AuthController(OperatorService operatorService) {
        this.operatorService = operatorService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        try {
            // Register the new operator with the role provided (or default VIEWER)
            Operator operator = operatorService.registerOperator(signupRequest);
            // Immediately authenticate and generate a token using the provided password
            String token = operatorService.authenticateOperator(signupRequest.getUsername(), signupRequest.getPassword());
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody LoginRequest loginRequest) {
        try {
            String token = operatorService.authenticateOperator(loginRequest.getUsername(), loginRequest.getPassword());
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Authentication failed: " + e.getMessage());
        }
    }
}