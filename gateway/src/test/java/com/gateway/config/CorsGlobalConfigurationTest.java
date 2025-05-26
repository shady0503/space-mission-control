package com.gateway.config;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.cors.reactive.CorsWebFilter;

@ExtendWith(MockitoExtension.class)
class CorsGlobalConfigurationTest {

    @InjectMocks
    private CorsGlobalConfiguration corsGlobalConfiguration;

    @Test
    void testCorsWebFilterCreation() {
        // When
        CorsWebFilter corsWebFilter = corsGlobalConfiguration.corsWebFilter();

        // Then
        assertNotNull(corsWebFilter);
    }

    @Test
    void testCorsWebFilterIsNotNull() {
        // When
        CorsWebFilter corsWebFilter = corsGlobalConfiguration.corsWebFilter();

        // Then
        assertNotNull(corsWebFilter, "CORS web filter should not be null");
    }
}