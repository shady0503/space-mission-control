package com.gateway;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.test.context.ActiveProfiles;

import reactor.core.publisher.Flux;

@SpringBootTest
@ActiveProfiles("test")
class GatewayRoutesIntegrationTest {

    @Autowired
    private RouteLocator routeLocator;

    @Test
    void testRouteLocatorIsNotNull() {
        assertNotNull(routeLocator, "RouteLocator should be autowired");
    }

    @Test
    void testRoutesAreConfigured() {
        // When
        Flux<Route> routes = routeLocator.getRoutes();
        List<Route> routeList = routes.collectList().block();

        // Then
        assertNotNull(routeList);
        assertEquals(6, routeList.size(), "Should have 6 configured routes");
    }

    @Test
    void testExpectedRoutesExist() {
        // Given
        List<String> expectedRouteIds = Arrays.asList("auth", "entreprise", "mission", "spacecraft", "telemetry", "dashboard");

        // When
        Flux<Route> routes = routeLocator.getRoutes();
        List<String> actualRouteIds = routes.map(Route::getId).collectList().block();

        // Then
        assertNotNull(actualRouteIds);
        assertTrue(actualRouteIds.containsAll(expectedRouteIds), 
                   "All expected routes should be present. Expected: " + expectedRouteIds + ", Actual: " + actualRouteIds);
    }

    @Test
    void testAuthRouteConfiguration() {
        // When
        Flux<Route> routes = routeLocator.getRoutes();
        List<Route> routeList = routes.collectList().block();

        // Then
        assertNotNull(routeList);
        Route authRoute = routeList.stream()
                .filter(route -> "auth".equals(route.getId()))
                .findFirst()
                .orElse(null);
        
        assertNotNull(authRoute, "Auth route should exist");
        assertEquals("http://localhost:8081", authRoute.getUri().toString());
    }
} 