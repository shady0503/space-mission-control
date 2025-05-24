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
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher.MatchResult;
import reactor.core.publisher.Mono;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

@Configuration
@EnableWebFluxSecurity
public class GatewaySecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.secret}")
    private String jwtSecret;

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                // disable CSRF
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(ex -> ex

                        // 1) allow CORS preflight
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()

                        // 2) any request from Prometheus (User-Agent starts with “Prometheus”)
                        .matchers(prometheusAgentMatcher()).permitAll()

                        // 3) your public auth endpoints
                        .pathMatchers(
                                "/auth/**",
                                "/api/auth/**",
                                "/oauth2/**",
                                "/login/oauth2/code/**",
                                "/ws/**"
                        ).permitAll()

                        // 4) all others require JWT
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtDecoder(jwtDecoder()))
                );

        return http.build();
    }

    /** Match any request whose User-Agent header begins with “Prometheus”. */
    private ServerWebExchangeMatcher prometheusAgentMatcher() {
        return exchange -> {
            String ua = exchange.getRequest()
                    .getHeaders()
                    .getFirst("User-Agent");
            boolean isPrometheus = ua != null && ua.startsWith("Prometheus");
            return Mono.just(Objects.requireNonNull((isPrometheus
                    ? MatchResult.match()
                    : MatchResult.notMatch()).block()));
        };
    }

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalArgumentException(
                    "JWT secret cannot be empty—configure spring.security.oauth2.resourceserver.jwt.secret"
            );
        }
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return NimbusReactiveJwtDecoder
                .withSecretKey(new SecretKeySpec(keyBytes, "HmacSHA256"))
                .build();
    }
}
