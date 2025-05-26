package com.gateway.config;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class GatewaySecurityConfigTest {

    @InjectMocks
    private GatewaySecurityConfig gatewaySecurityConfig;

    @Test
    void testJwtDecoderWithValidSecret() {
        // Given
        String validSecret = "test-secret-key-for-unit-tests-only";
        ReflectionTestUtils.setField(gatewaySecurityConfig, "jwtSecret", validSecret);

        // When
        ReactiveJwtDecoder decoder = gatewaySecurityConfig.jwtDecoder();

        // Then
        assertNotNull(decoder);
    }

    @Test
    void testJwtDecoderWithEmptySecret() {
        // Given
        String emptySecret = "";
        ReflectionTestUtils.setField(gatewaySecurityConfig, "jwtSecret", emptySecret);

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> gatewaySecurityConfig.jwtDecoder());

        assertTrue(exception.getMessage().contains("JWT secret cannot be empty"));
    }

    @Test
    void testJwtDecoderWithNullSecret() {
        // Given
        ReflectionTestUtils.setField(gatewaySecurityConfig, "jwtSecret", null);

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> gatewaySecurityConfig.jwtDecoder());

        assertTrue(exception.getMessage().contains("JWT secret cannot be empty"));
    }

    @Test
    void testJwtDecoderWithBlankSecret() {
        // Given
        String blankSecret = "   ";
        ReflectionTestUtils.setField(gatewaySecurityConfig, "jwtSecret", blankSecret);

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> gatewaySecurityConfig.jwtDecoder());

        assertTrue(exception.getMessage().contains("JWT secret cannot be empty"));
    }
}