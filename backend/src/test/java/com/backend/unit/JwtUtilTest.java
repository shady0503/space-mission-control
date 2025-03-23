package com.backend.unit;

import com.backend.commands.model.Operator;
import com.backend.commands.model.Role;
import com.backend.utils.JwtUtil;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.Date;

public class JwtUtilTest {

    @Test
    public void testGenerateAndValidateToken() {
        JwtUtil jwtUtil = new JwtUtil();
        try {
            // Set the secret to a secure key (32 characters for HS256 or 64 for HS512)
            java.lang.reflect.Field secretField = JwtUtil.class.getDeclaredField("jwtSecret");
            secretField.setAccessible(true);
            secretField.set(jwtUtil, "01234567890123456789012345678901"); // 32 chars

            java.lang.reflect.Field expirationField = JwtUtil.class.getDeclaredField("jwtExpirationInMs");
            expirationField.setAccessible(true);
            expirationField.set(jwtUtil, 3600000L); // 1 hour
        } catch (Exception e) {
            fail("Failed to set JwtUtil fields: " + e.getMessage());
        }

        Operator operator = new Operator();
        operator.setUsername("testuser");
        operator.setRole(Role.VIEWER);
        operator.setCreatedAt(new Date());
        operator.setEmail("testuser@example.com");

        String token = jwtUtil.generateToken(operator);
        assertNotNull(token, "Token should not be null");
        assertTrue(jwtUtil.validateToken(token), "Token should be valid");

        String username = jwtUtil.getUsernameFromJWT(token);
        assertEquals("testuser", username, "Username should match");
    }
}
