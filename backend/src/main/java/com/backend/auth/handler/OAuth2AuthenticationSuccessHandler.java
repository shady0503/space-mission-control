package com.backend.auth.handler;

import com.backend.commands.model.Operator;
import com.backend.commands.repository.OperatorRepository;
import com.backend.utils.JwtUtil;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.ServletException;
import java.io.IOException;
import java.util.Optional;

public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final OperatorRepository operatorRepository;

    public OAuth2AuthenticationSuccessHandler(JwtUtil jwtUtil, OperatorRepository operatorRepository) {
        this.jwtUtil = jwtUtil;
        this.operatorRepository = operatorRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String username = (String) oAuth2User.getAttribute("email");
        if(username == null) {
            username = oAuth2User.getName();
        }
        Optional<Operator> operatorOpt = operatorRepository.findByUsername(username);
        if(operatorOpt.isPresent()){
            String token = jwtUtil.generateToken(operatorOpt.get());
            response.setContentType("application/json");
            response.getWriter().write("{\"token\": \"" + token + "\"}");
        } else {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Operator not found");
        }
    }
}
