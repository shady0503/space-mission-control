package com.backend.auth.service;

import com.backend.commands.model.Operator;
import com.backend.commands.model.Role;
import com.backend.commands.repository.OperatorRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.Date;
import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final OperatorRepository operatorRepository;

    public CustomOAuth2UserService(OperatorRepository operatorRepository) {
        this.operatorRepository = operatorRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User user = super.loadUser(userRequest);
        syncOperator(user, userRequest.getClientRegistration().getRegistrationId());
        return user;
    }

    private void syncOperator(OAuth2User oauth2User, String provider) {
        String username;
        String email;
        Map<String, Object> attributes = oauth2User.getAttributes();

        if (provider.equalsIgnoreCase("github")) {
            username = (String) attributes.get("login");
            email = (String) attributes.get("email");
            if(email == null){
                email = username + "@github.com"; // fallback if email not provided
            }
        } else if (provider.equalsIgnoreCase("google")) {
            username = (String) attributes.get("email"); // using email as username
            email = (String) attributes.get("email");
        } else {
            username = oauth2User.getName();
            email = (String) attributes.get("email");
        }
        Optional<Operator> existing = operatorRepository.findByUsername(username);
        if(existing.isPresent()){
            Operator operator = existing.get();
            if(email != null && !email.equals(operator.getEmail())){
                operator.setEmail(email);
                operatorRepository.save(operator);
            }
        } else {
            Operator operator = new Operator();
            operator.setUsername(username);
            operator.setEmail(email);
            operator.setRole(Role.VIEWER); // default role for external sign-ins
            operator.setCreatedAt(new Date());
            // For external login, leave hashedPassword null
            operatorRepository.save(operator);
        }
    }
}
