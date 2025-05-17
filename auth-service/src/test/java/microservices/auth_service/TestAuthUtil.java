// src/test/java/microservices/auth_service/TestAuthUtil.java
package microservices.auth_service;

import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

public class TestAuthUtil {
    public static void setAuth(String username) {
        var auth = new TestingAuthenticationToken(username, null);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
    public static void clearAuth() {
        SecurityContextHolder.clearContext();
    }
}
