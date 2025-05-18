package microservices.auth_service.service;

import microservices.auth_service.client.MissionClient;
import microservices.auth_service.dto.MissionRole;
import microservices.auth_service.dto.OperatorResponse;
import microservices.auth_service.dto.SignupRequest;
import microservices.auth_service.dto.UpdateOperatorRequest;
import microservices.auth_service.event.OperatorCreatedEvent;
import microservices.auth_service.model.MissionOperator;
import microservices.auth_service.model.Operator;
import microservices.auth_service.repository.OperatorRepository;
import microservices.auth_service.utils.JwtUtil;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OperatorService {

    private final OperatorRepository operatorRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ApplicationEventPublisher events;
    private final MissionClient missionClient;

    public OperatorService(OperatorRepository operatorRepo,
                           BCryptPasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil,
                           ApplicationEventPublisher events, MissionClient missionClient) {
        this.operatorRepo    = operatorRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil         = jwtUtil;
        this.events          = events;
        this.missionClient = missionClient;
    }

    @Transactional
    public Operator register(SignupRequest req) {
        if (operatorRepo.findByUsername(req.getUsername()).isPresent()) {
            throw new IllegalStateException("Username already taken");
        }

        Operator op = new Operator();
        op.setUsername(req.getUsername());
        op.setEmail(req.getEmail());
        op.setHashedPassword(passwordEncoder.encode(req.getPassword()));

        op = operatorRepo.save(op);

        if(req.email()==null) {
            op.setEmail("@Null.com");
        }

        events.publishEvent(
                new OperatorCreatedEvent(this, op.getId(), op.getUsername(), op.getEmail())
        );

        return op;
    }



    public String authenticate(String identifier, String rawPassword) {
        Operator op = operatorRepo.findByUsername(identifier)
                .or(() -> operatorRepo.findByEmail(identifier))
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(rawPassword, op.getHashedPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        return jwtUtil.generateToken(op);
    }

    public MissionClient.MissionOperatorDto updateOperatorRole(
            UUID missionId,
            UUID operatorId,
            MissionRole newRole
    ) {
        // optional: verify operator exists locally
        operatorRepo.findById(operatorId)
                .orElseThrow(() -> new IllegalArgumentException("Operator not found: " + operatorId));

        // call the remote service
        return missionClient.updateOperatorRole(
                missionId,
                operatorId,
                new MissionClient.UpdateOperatorRoleRequest(newRole.name())
        );
    }


    public String generateTokenFor(String username) {
        Operator op = getByUsername(username);
        return jwtUtil.generateToken(op);
    }

    public Operator getById(UUID id) {
        return operatorRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Operator not found: " + id));
    }

    public Operator getByUsername(String username) {
        return operatorRepo.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Operator not found: " + username));
    }

    @Transactional
    public void syncOAuthUser(OAuth2User oauth2User, String provider) {
        try {
            System.out.println("===== syncOAuthUser Debug =====");
            Map<String, Object> attributes = oauth2User.getAttributes();
            System.out.println("OAuth attributes: " + attributes);
            System.out.println("Provider: " + provider);

            String username = extractUsername(attributes, provider);
            System.out.println("Extracted username: " + username);

            String email = Optional.ofNullable((String) attributes.get("email"))
                    .orElse(username + "@users.noreply.github.com");
            System.out.println("Extracted email: " + email);

            Optional<Operator> existingOp = operatorRepo.findByUsername(username);
            System.out.println("User exists in DB: " + existingOp.isPresent());

            if (existingOp.isPresent()) {
                Operator op = existingOp.get();
                if (!email.equals(op.getEmail())) {
                    op.setEmail(email);
                    operatorRepo.save(op);
                }
            } else {
                Operator newOp = new Operator();
                newOp.setUsername(username);
                newOp.setEmail(email);

                // If this is a GitHub user, they don't need a password for login
                // But some JPA configurations might require a non-null password
                if (newOp.getHashedPassword() == null) {
                    System.out.println("Setting dummy hashed password for OAuth user");
                    newOp.setHashedPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                }

                newOp = operatorRepo.save(newOp);
                System.out.println("New user created with ID: " + newOp.getId());

                events.publishEvent(
                        new OperatorCreatedEvent(this, newOp.getId(), username, email)
                );
                System.out.println("OperatorCreatedEvent published");
            }
        } catch (Exception e) {
            System.err.println("ERROR in syncOAuthUser: " + e.getMessage());
            e.printStackTrace();
            throw e;  // Rethrow to ensure transaction rollback
        }
    }

    public String detectProvider(String requestUri) {
        String uri = requestUri.toLowerCase();
        if (uri.contains("github")) return "github";
        if (uri.contains("google")) return "google";
        return "generic";
    }

    public String extractUsername(Map<String, Object> attrs, String provider) {
        if ("github".equalsIgnoreCase(provider)) {
            return (String) attrs.get("login");
        } else if ("google".equalsIgnoreCase(provider)) {
            return (String) attrs.get("email");
        } else {
            return (String) attrs.getOrDefault("email", attrs.get("name"));
        }
    }
    @Transactional
    public Operator updateProfile(UUID id, UpdateOperatorRequest req) {
        Operator op = operatorRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Operator not found: " + id));

        // Update email if provided
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            op.setEmail(req.getEmail());
        }

        // Update password if provided
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            String hashed = passwordEncoder.encode(req.getPassword());
            op.setHashedPassword(hashed);
        }

        if(req.getUsername()!=null && !req.getUsername().isBlank()){
            op.setUsername(req.getUsername());
        }

        // Update enterprise assignment (nullable)
        op.setEnterpriseId(req.getEnterpriseId());

        // Persist changes
        return operatorRepo.save(op);
    }
    public Optional<Operator> findByUsername(String username) {
        return operatorRepo.findByUsername(username);
    }

    public List<Operator> findByEnterpriseId(UUID enterpriseId) {
        return  operatorRepo.findByEnterpriseId(enterpriseId);
    }

    public Long countByEnterpriseId(UUID enterpriseId) {
        return operatorRepo.countOperatorByEnterpriseId(enterpriseId);
    }



    public List<OperatorResponse> search(String searchQuery) {
        if (searchQuery == null || searchQuery.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String query = searchQuery.toLowerCase().trim();

        return operatorRepo.findAll().stream()
                .filter(operator ->
                        operator.getUsername().toLowerCase().contains(query) ||
                                operator.getEmail().toLowerCase().contains(query))
                .map(op -> new OperatorResponse(
                        op.getId(),
                        op.getUsername(),
                        op.getEmail(),
                        op.getCreatedAt(),
                        op.getEnterpriseId()
                ))
                .collect(Collectors.toList());
    }

    public OperatorResponse addToenterprise(UUID operatorId, UUID enterpriseID) {
        Operator O = operatorRepo.findById(operatorId).isPresent() ? operatorRepo.findById(operatorId).get() : null;
        if(O==null){
            throw new IllegalArgumentException("Operator not found");
        }

        if(O.getEnterpriseId()!=null){
            throw new IllegalArgumentException("Operator already exists in an Enterprise");
        }


        O.setEnterpriseId(enterpriseID);
        operatorRepo.save(O);
        return new OperatorResponse(
                O.getId(),
                O.getUsername(),
                O.getEmail(),
                O.getCreatedAt(),
                enterpriseID
        );

    }

    public List<OperatorResponse> findAll() {
        List<Operator> ops = operatorRepo.findAll();
        List<OperatorResponse> opResponses = new ArrayList<>();
        for (Operator op : ops) {
            opResponses.add(new OperatorResponse(
                    op.getId(),
                    op.getUsername(),
                    op.getEmail(),
                    op.getCreatedAt(),
                    op.getEnterpriseId()
            ));
        }
        return opResponses;
    }
}
