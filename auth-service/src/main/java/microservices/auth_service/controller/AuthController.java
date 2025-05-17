// src/main/java/com/yourorg/auth/controller/AuthController.java
package microservices.auth_service.controller;


import lombok.RequiredArgsConstructor;
import microservices.auth_service.client.EnterpriseClient;
import microservices.auth_service.dto.AuthResponse;
import microservices.auth_service.dto.EnterpriseDTO;
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
    private final EnterpriseClient enterpriseClient;

    public AuthController(OperatorService operatorService, EnterpriseClient enterpriseClient) {
        this.operatorService = operatorService;
        this.enterpriseClient = enterpriseClient;
    }

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
            operatorService.addToenterprise(op.getId(), created.getId());
        }

        // Generate authentication token
        String token = operatorService.generateTokenFor(op.getUsername());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@RequestBody LoginRequest req) {
        String token = operatorService.authenticate(req.identifier(), req.password());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
