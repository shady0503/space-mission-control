package microservices.auth_service.config;

import microservices.auth_service.filter.JWTAuthenticationFilter;
import microservices.auth_service.handler.OAuth2AuthenticationSuccessHandler;
import microservices.auth_service.service.CustomOAuth2UserService;
import microservices.auth_service.service.OperatorService;
import microservices.auth_service.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.RequestHeaderRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService oAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler successHandler;
    private final JwtUtil jwtUtil;
    private final OperatorService operatorService;

    @Value("${app.cors.allowed-origin}")
    private String allowedOrigin;

    public SecurityConfig(CustomOAuth2UserService oAuth2UserService,
                          OAuth2AuthenticationSuccessHandler successHandler,
                          JwtUtil jwtUtil,
                          OperatorService operatorService) {
        this.oAuth2UserService = oAuth2UserService;
        this.successHandler = successHandler;
        this.jwtUtil = jwtUtil;
        this.operatorService = operatorService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF and use stateless session
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Disable default login mechanisms
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)

                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Allow Prometheus scrapes
                        .requestMatchers(EndpointRequest.to("prometheus")).permitAll()

                        // Public OAuth and auth endpoints
                        .requestMatchers(
                                "/api/auth/**",
                                "/oauth2/**",
                                "/login/oauth2/code/**"
                        ).permitAll()

                        // CORS Preflight
                        .requestMatchers(HttpMethod.OPTIONS).permitAll()

                        // Operator APIs secured
                        .requestMatchers("/api/operator/**").authenticated()

                        // All other requests require authentication
                        .anyRequest().authenticated()
                )

                // Insert JWT filter
                .addFilterBefore(
                        jwtAuthenticationFilter(),
                        UsernamePasswordAuthenticationFilter.class
                )

                // JSON-style 401 / 403
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint())
                        .accessDeniedHandler(new BearerTokenAccessDeniedHandler())
                )

                // Optional OAuth2 login flow
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(a -> a.baseUri("/oauth2/authorization"))
                        .redirectionEndpoint(r -> r.baseUri("/login/oauth2/code/*"))
                        .userInfoEndpoint(u -> u.userService(oAuth2UserService))
                        .successHandler(successHandler)
                );

        return http.build();
    }

    @Bean
    public JWTAuthenticationFilter jwtAuthenticationFilter() {
        return new JWTAuthenticationFilter(jwtUtil, operatorService);
    }
}