package microservices.auth_service.handler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import microservices.auth_service.repository.OperatorRepository;
import microservices.auth_service.service.OperatorService;
import microservices.auth_service.utils.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

    private final JwtUtil jwtUtil;
    private final OperatorService operatorService;
    private final OperatorRepository operatorRepository;
    private final String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(
            JwtUtil jwtUtil,
            OperatorService operatorService,
            OperatorRepository operatorRepository,
            @Value("${app.frontend.url}") String frontendUrl) {
        this.jwtUtil = jwtUtil;
        this.operatorService = operatorService;
        this.operatorRepository = operatorRepository;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest req,
                                        HttpServletResponse res,
                                        Authentication auth)
            throws IOException {
        try {
            logger.info("===== OAuth2 Authentication Success Handler =====");
            logger.info("Request URI: {}", req.getRequestURI());

            OAuth2User oauth = (OAuth2User) auth.getPrincipal();
            logger.info("OAuth2User principal obtained: {}", (oauth != null));

            if (oauth == null) {
                logger.error("OAuth2User is null");
                res.sendRedirect(frontendUrl + "/callback?error=auth_failed&message=OAuth2User%20is%20null");
                return;
            }

            logger.debug("OAuth2User attributes: {}", oauth.getAttributes());

            // Detect provider
            String provider;
            if (req.getRequestURI().contains("github")) {
                provider = "github";
            } else if (req.getRequestURI().contains("google")) {
                provider = "google";
            } else {
                provider = "generic";
            }
            logger.info("Detected provider: {}", provider);

            // Extract username
            String username = null;
            Map<String, Object> attributes = oauth.getAttributes();

            if ("github".equals(provider)) {
                username = (String) attributes.get("login");
            } else if ("google".equals(provider)) {
                username = (String) attributes.get("email");
            } else {
                username = (String) attributes.getOrDefault("email", attributes.get("name"));
            }

            logger.info("Extracted username: {}", username);

            if (username == null) {
                logger.error("Could not extract username from OAuth2 attributes");
                res.sendRedirect(frontendUrl + "/callback?error=auth_failed&message=Could%20not%20extract%20username");
                return;
            }

            // Check if user exists and create if not
            boolean userExists = operatorRepository.findByUsername(username).isPresent();
            logger.info("User exists in database: {}", userExists);

            if (!userExists) {
                logger.info("Creating new user: {}", username);
                // Create a new user
                operatorService.syncOAuthUser(oauth, provider);
                logger.info("User created successfully");
            }

            // Generate token
            logger.info("Generating token for username: {}", username);
            String token = operatorService.generateTokenFor(username);

            if (token == null || token.isEmpty()) {
                logger.error("Failed to generate token");
                res.sendRedirect(frontendUrl + "/callback?error=auth_failed&message=Token%20generation%20failed");
                return;
            }

            logger.info("Token generated successfully");

            // Redirect with token
            String redirectUrl = frontendUrl + "/callback?token=" + token;
            logger.info("Redirecting to: {}", redirectUrl);

            res.sendRedirect(redirectUrl);
            logger.info("Redirect sent successfully");

        } catch (Exception e) {
            logger.error("ERROR in OAuth2AuthenticationSuccessHandler: {}", e.getMessage(), e);
            res.sendRedirect(frontendUrl + "/callback?error=auth_failed&message=" + e.getMessage());
        }
    }
}