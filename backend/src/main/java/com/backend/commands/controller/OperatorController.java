package com.backend.commands.controller;

import com.backend.commands.model.Operator;
import com.backend.commands.service.OperatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/operator")
public class OperatorController {

    private final OperatorService operatorService;

    public OperatorController(OperatorService operatorService) {
        this.operatorService = operatorService;
    }

    @GetMapping("/me")
    public ResponseEntity<Operator> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        Operator operator = operatorService.findOperatorByUsername(username);
        if (operator != null) {
            return ResponseEntity.ok(operator);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
