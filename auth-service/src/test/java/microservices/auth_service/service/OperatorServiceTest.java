package microservices.auth_service.service;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import microservices.auth_service.client.MissionClient;
import microservices.auth_service.dto.SignupRequest;
import microservices.auth_service.model.Operator;
import microservices.auth_service.repository.OperatorRepository;
import microservices.auth_service.utils.JwtUtil;

@ExtendWith(MockitoExtension.class)
class OperatorServiceTest {

    @Mock
    private OperatorRepository operatorRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private MissionClient missionClient;

    private OperatorService operatorService;

    @BeforeEach
    void setUp() {
        operatorService = new OperatorService(
                operatorRepository,
                passwordEncoder,
                jwtUtil,
                eventPublisher,
                missionClient);
    }

    @Test
    void shouldRegisterNewOperator() {
        // Given
        SignupRequest request = new SignupRequest("testuser", "test@example.com", "password123", null, null);
        when(operatorRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");

        Operator savedOperator = new Operator();
        savedOperator.setId(UUID.randomUUID());
        savedOperator.setUsername("testuser");
        savedOperator.setEmail("test@example.com");
        savedOperator.setHashedPassword("hashedPassword");

        when(operatorRepository.save(any(Operator.class))).thenReturn(savedOperator);

        // When
        Operator result = operatorService.register(request);

        // Then
        assertThat(result.getUsername()).isEqualTo("testuser");
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        verify(operatorRepository).save(any(Operator.class));
        verify(eventPublisher).publishEvent(any());
    }

    @Test
    void shouldThrowExceptionWhenUsernameAlreadyExists() {
        // Given
        SignupRequest request = new SignupRequest("existinguser", "test@example.com", "password123", null, null);
        Operator existingOperator = new Operator();
        when(operatorRepository.findByUsername("existinguser")).thenReturn(Optional.of(existingOperator));

        // When & Then
        assertThatThrownBy(() -> operatorService.register(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Username already taken");

        verify(operatorRepository, never()).save(any());
    }

    @Test
    void shouldAuthenticateValidUser() {
        // Given
        Operator operator = new Operator();
        operator.setId(UUID.randomUUID());
        operator.setUsername("testuser");
        operator.setHashedPassword("hashedPassword");

        when(operatorRepository.findByUsername("testuser")).thenReturn(Optional.of(operator));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(operator)).thenReturn("jwt-token");

        // When
        String token = operatorService.authenticate("testuser", "password123");

        // Then
        assertThat(token).isEqualTo("jwt-token");
    }

    @Test
    void shouldThrowExceptionForInvalidCredentials() {
        // Given
        when(operatorRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());
        when(operatorRepository.findByEmail("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> operatorService.authenticate("nonexistent", "password"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    void shouldThrowExceptionForWrongPassword() {
        // Given
        Operator operator = new Operator();
        operator.setUsername("testuser");
        operator.setHashedPassword("hashedPassword");

        when(operatorRepository.findByUsername("testuser")).thenReturn(Optional.of(operator));
        when(passwordEncoder.matches("wrongpassword", "hashedPassword")).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> operatorService.authenticate("testuser", "wrongpassword"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    void shouldFindOperatorById() {
        // Given
        UUID operatorId = UUID.randomUUID();
        Operator operator = new Operator();
        operator.setId(operatorId);
        operator.setUsername("testuser");

        when(operatorRepository.findById(operatorId)).thenReturn(Optional.of(operator));

        // When
        Operator result = operatorService.getById(operatorId);

        // Then
        assertThat(result.getId()).isEqualTo(operatorId);
        assertThat(result.getUsername()).isEqualTo("testuser");
    }

    @Test
    void shouldThrowExceptionWhenOperatorNotFoundById() {
        // Given
        UUID operatorId = UUID.randomUUID();
        when(operatorRepository.findById(operatorId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> operatorService.getById(operatorId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Operator not found: " + operatorId);
    }

    @Test
    void shouldFindOperatorByUsername() {
        // Given
        Operator operator = new Operator();
        operator.setUsername("testuser");

        when(operatorRepository.findByUsername("testuser")).thenReturn(Optional.of(operator));

        // When
        Operator result = operatorService.getByUsername("testuser");

        // Then
        assertThat(result.getUsername()).isEqualTo("testuser");
    }

    @Test
    void shouldGenerateTokenForUsername() {
        // Given
        Operator operator = new Operator();
        operator.setUsername("testuser");

        when(operatorRepository.findByUsername("testuser")).thenReturn(Optional.of(operator));
        when(jwtUtil.generateToken(operator)).thenReturn("generated-token");

        // When
        String token = operatorService.generateTokenFor("testuser");

        // Then
        assertThat(token).isEqualTo("generated-token");
    }
}