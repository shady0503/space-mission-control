// src/main/java/com/yourorg/auth/controller/AuthController.java
package microservices.auth_service.controller;


import lombok.RequiredArgsConstructor;
import microservices.auth_service.dto.AuthResponse;
import microservices.auth_service.dto.LoginRequest;
import microservices.auth_service.dto.SignupRequest;
import microservices.auth_service.model.Operator;
import microservices.auth_service.service.OperatorService;
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
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest req) {
        Operator op = operatorService.register(req);
        String token = operatorService.generateTokenFor(op.getUsername());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@RequestBody LoginRequest req) {
        String token = operatorService.authenticate(req.identifier(), req.password());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
