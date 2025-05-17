// src/main/java/microservices/auth_service/filter/JWTAuthenticationFilter.java
package microservices.auth_service.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import microservices.auth_service.service.OperatorService;
import microservices.auth_service.utils.JwtUtil;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final OperatorService operatorService;

    public JWTAuthenticationFilter(JwtUtil jwtUtil, OperatorService operatorService) {
        this.jwtUtil = jwtUtil;
        this.operatorService = operatorService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        // skip JWT processing on signup/signin and OAuth2 callback paths
        String path = request.getServletPath();
        return path.startsWith("/api/auth/")
                || path.startsWith("/oauth2/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtUtil.validateToken(token)) {
                String username = jwtUtil.getUsernameFromJWT(token);
                operatorService.findByUsername(username).ifPresent(op -> {
                    // No per-operator role field anymore → authenticate with empty authorities:
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(username, null, Collections.emptyList());
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                });
            }
        }


        filterChain.doFilter(request, response);
    }
}
