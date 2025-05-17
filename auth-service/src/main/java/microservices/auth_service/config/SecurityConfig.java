// src/main/java/microservices/auth_service/config/SecurityConfig.java
package microservices.auth_service.config;

import microservices.auth_service.filter.JWTAuthenticationFilter;
import microservices.auth_service.handler.OAuth2AuthenticationSuccessHandler;
import microservices.auth_service.service.CustomOAuth2UserService;
import microservices.auth_service.service.OperatorService;
import microservices.auth_service.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService         oAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler successHandler;
    private final JwtUtil         jwtUtil;
    private final OperatorService operatorService;

    @Value("${app.cors.allowed-origin}")
    private String allowedOrigin;

    public SecurityConfig(CustomOAuth2UserService oAuth2UserService,
                          OAuth2AuthenticationSuccessHandler successHandler,
                          JwtUtil jwtUtil,
                          OperatorService operatorService) {
        this.oAuth2UserService = oAuth2UserService;
        this.successHandler    = successHandler;
        this.jwtUtil           = jwtUtil;
        this.operatorService   = operatorService;
    }

    /* -----  FILTER CHAIN  ----- */

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                /* CORS & stateless */
//                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                /* no form-login or http-basic */
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)

                /* authorisation rules */
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**",
                                "/oauth2/**",
                                "/login/oauth2/code/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS).permitAll()
                        .requestMatchers("/api/operator/**").authenticated()
                        .anyRequest().authenticated()
                )

                /* plug in our JWT filter  */
                .addFilterBefore(jwtAuthenticationFilter(),
                        UsernamePasswordAuthenticationFilter.class)

                /* JSON-style 401 / 403 */
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint())
                        .accessDeniedHandler(new BearerTokenAccessDeniedHandler())
                )

                /* (optional) browser OAuth2 login */
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(a -> a.baseUri("/oauth2/authorization"))
                        .redirectionEndpoint(r -> r.baseUri("/login/oauth2/code/*"))
                        .userInfoEndpoint(u -> u.userService(oAuth2UserService))
                        .successHandler(successHandler)
                );

        return http.build();
    }

    /* -----  JWT filter bean  ----- */

    @Bean
    public JWTAuthenticationFilter jwtAuthenticationFilter() {
        return new JWTAuthenticationFilter(jwtUtil, operatorService);
    }

    /* -----  CORS  ----- */

//    @Bean
//    public CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration cfg = new CorsConfiguration();
//        // allow any origin, method, header:
//        cfg.setAllowedOriginPatterns(Collections.singletonList(CorsConfiguration.ALL));
//        cfg.addAllowedMethod(CorsConfiguration.ALL);
//        cfg.addAllowedHeader(CorsConfiguration.ALL);
//        cfg.setAllowCredentials(true);
//
//        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
//        src.registerCorsConfiguration("/**", cfg);
//        return src;
//    }
}
