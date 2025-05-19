// src/main/java/com/yourorg/auth/controller/AuthController.java
package microservices.auth_service.controller;


import lombok.RequiredArgsConstructor;
import microservices.auth_service.client.EnterpriseClient;
import microservices.auth_service.client.MissionClient;
import microservices.auth_service.client.SpacecraftClient;
import microservices.auth_service.dto.*;
import microservices.auth_service.model.Operator;
import microservices.auth_service.service.OperatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final OperatorService operatorService;
    private final EnterpriseClient enterpriseClient;
    private final MissionClient missionClient;
    private final SpacecraftClient spacecraftClient;

    public AuthController(OperatorService operatorService, EnterpriseClient enterpriseClient, MissionClient missionClient, SpacecraftClient spacecraftClient) {
        this.operatorService = operatorService;
        this.enterpriseClient = enterpriseClient;
        this.missionClient = missionClient;
        this.spacecraftClient = spacecraftClient;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(
            @RequestBody SignupRequest req,
            @RequestParam(name = "enterpriseChoice", defaultValue = "await_invitation") String enterpriseChoice) {

        // Create operator account regardless of enterprise choice
        Operator op = operatorService.register(req);

        String token = operatorService.generateTokenFor(op.getUsername());
        String bearer = "Bearer " + token;


        // Handle enterprise based on the choice parameter
        if ("create_enterprise".equals(enterpriseChoice)) {
            // Create a new enterprise with the operator as admin
            EnterpriseDTO enterpriseDTO = new EnterpriseDTO();
            enterpriseDTO.setName(req.getUsername() + "Enterprise");
            EnterpriseDTO created = enterpriseClient.createEnterprise(enterpriseDTO);
            String usernameOrEmail = (op.getUsername() != null && !op.getUsername().isEmpty())
                    ? op.getUsername()
                    : op.getEmail();
            // Add operator to the new enterprise
            operatorService.addToenterprise(op.getId(), created.getId());

            // Create a new mission with the operator as admin
            MissionClient.CreateMissionRequest request = new MissionClient.CreateMissionRequest(
                    "demo for user: " + usernameOrEmail,
                    "demo for user: " + usernameOrEmail,
                    LocalDate.now().toString(),
                    LocalDate.now().plusDays(7).toString(),
                    created.getId()// or any other logic for end date
            );


            // Call the mission service (passing operatorId as query param)
            MissionClient.MissionDto mission = missionClient.createMission(bearer, request, op.getId());

            // create a spacecraft with externalId 25544
            String userTag = (op.getUsername() != null && !op.getUsername().isEmpty()) ? op.getUsername() : op.getEmail();
            String spacecraftName = "25544 - " + userTag;

            SpacecraftCreateRequest spacecraftRequest = new SpacecraftCreateRequest(
                    25544L,
                    spacecraftName,
                    spacecraftName,
                    created.getId(),
                    mission.id(),
                    "SATELLITE" // Ensure this matches SpacecraftType in spacecraft service
            );

            spacecraftClient.create(spacecraftRequest);
        }


        // Generate authentication token
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@RequestBody LoginRequest req) {
        String token = operatorService.authenticate(req.identifier(), req.password());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
