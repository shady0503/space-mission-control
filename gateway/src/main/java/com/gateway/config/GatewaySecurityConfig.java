package com.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebFluxSecurity
public class GatewaySecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.secret}")  // Must match the property in auth service
    private String jwtSecret;

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchange -> exchange
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()
                        .pathMatchers("/auth/**", "/api/auth/**", "/oauth2/**", "/login/oauth2/code/**", "ws/**").permitAll()
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtDecoder(jwtDecoder()))
                )
                .build();
    }

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalArgumentException("JWT secret key cannot be empty. Please configure app.jwt.secret");
        }

        // The exact same key preparation as in your auth service
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);

        return NimbusReactiveJwtDecoder.withSecretKey(new SecretKeySpec(keyBytes, "HmacSHA256"))
                .build();
    }
}