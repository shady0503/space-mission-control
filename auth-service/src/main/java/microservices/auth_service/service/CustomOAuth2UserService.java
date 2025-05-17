// src/main/java/com/yourorg/auth/service/CustomOAuth2UserService.java
package microservices.auth_service.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

/**
 * On OAuth login, sync or create the Operator in our DB.
 */
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final OperatorService operatorService;

    public CustomOAuth2UserService(OperatorService operatorService) {
        this.operatorService = operatorService;
    }


    @Override
    public OAuth2User loadUser(OAuth2UserRequest req) {
        Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);
        logger.info("===== CustomOAuth2UserService loadUser called =====");
        logger.info("ClientRegistration ID: {}", req.getClientRegistration().getRegistrationId());

        try {
            OAuth2User user = super.loadUser(req);
            logger.info("OAuth2User loaded successfully from provider");

            operatorService.syncOAuthUser(user, req.getClientRegistration().getRegistrationId());
            logger.info("User synchronized with database");

            return user;
        } catch (Exception e) {
            logger.error("Error in CustomOAuth2UserService: {}", e.getMessage(), e);
            throw e;
        }
    }
}
