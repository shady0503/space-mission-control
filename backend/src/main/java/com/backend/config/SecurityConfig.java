package com.backend.config;

import com.backend.commands.service.OperatorService;
import com.backend.commands.repository.OperatorRepository;
import com.backend.auth.service.CustomOAuth2UserService;
import com.backend.auth.filter.JWTAuthenticationFilter;
import com.backend.utils.JwtUtil;
import com.backend.auth.handler.OAuth2AuthenticationSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final OperatorService operatorService;
    private final JwtUtil jwtUtil;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OperatorRepository operatorRepository;

    public SecurityConfig(OperatorService operatorService, JwtUtil jwtUtil,
                          CustomOAuth2UserService customOAuth2UserService,
                          OperatorRepository operatorRepository) {
        this.operatorService = operatorService;
        this.jwtUtil = jwtUtil;
        this.customOAuth2UserService = customOAuth2UserService;
        this.operatorRepository = operatorRepository;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        JWTAuthenticationFilter jwtFilter = new JWTAuthenticationFilter(jwtUtil, operatorService);
        OAuth2AuthenticationSuccessHandler oAuth2SuccessHandler = new OAuth2AuthenticationSuccessHandler(jwtUtil, operatorRepository);

        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/telemetry").permitAll() // Add this line
                        .requestMatchers("/error").permitAll()

                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oAuth2SuccessHandler)
                );
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring().requestMatchers("/ws/**", "/telemetry");
    }

}