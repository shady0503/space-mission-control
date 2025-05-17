package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class SignupController {

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(
            @RequestBody SignupRequest req,
            @RequestParam(name = "enterpriseChoice", defaultValue = "await_invitation") String enterpriseChoice) {
        
        // Create operator account regardless of enterprise choice
        Operator op = operatorService.register(req);
        
        // Handle enterprise based on the choice parameter
        if ("create_enterprise".equals(enterpriseChoice)) {
            // Create a new enterprise with the operator as admin
            EnterpriseDTO enterpriseDTO = new EnterpriseDTO();
            enterpriseDTO.setName(req.getUsername() + "Enterprise");
            EnterpriseDTO created = enterpriseClient.createEnterprise(enterpriseDTO);
            
            // Add operator to the new enterprise
            operatorService.addToEnterprise(op.getId(), created.getId());
        } else {
            // Default: User will await invitation to an enterprise
            // Mark operator as awaiting invitation (implementation depends on your system)
            operatorService.markAsAwaitingInvitation(op.getId());
        }
        
        // Generate authentication token
        String token = operatorService.generateTokenFor(op.getUsername());
        return ResponseEntity.ok(new AuthResponse(token));
    }
} 