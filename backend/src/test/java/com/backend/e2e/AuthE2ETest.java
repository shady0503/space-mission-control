package com.backend.e2e;

import io.restassured.RestAssured;
import io.restassured.response.Response;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.notNullValue;

public class AuthE2ETest {

    @BeforeAll
    public static void setup() {
        RestAssured.baseURI = "http://localhost";
        RestAssured.port = 8080;
    }

    @Test
    public void testSignupAndRetrieveToken() {
        // Generate a unique username to prevent collisions
        String uniqueUsername = "e2eUser_" + System.currentTimeMillis();
        String jsonBody = String.format("{ \"username\": \"%s\", \"email\": \"%s@example.com\", \"password\": \"e2epassword\", \"role\": \"ADMIN\" }",
                uniqueUsername, uniqueUsername);

        Response response = given()
                .contentType("application/json")
                .body(jsonBody)
                .when()
                .post("/api/auth/signup")
                .then()
                .statusCode(200)
                .body("token", notNullValue())
                .extract()
                .response();

        String token = response.jsonPath().getString("token");
        System.out.println("Received token: " + token);
    }
}
