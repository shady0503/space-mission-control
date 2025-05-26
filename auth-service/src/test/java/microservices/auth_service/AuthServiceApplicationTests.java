package microservices.auth_service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("test")
public class AuthServiceApplicationTests {

	@Autowired
	private ApplicationContext applicationContext;

	@Test
	public void contextLoads() {
		assertTrue(true, "Application context should load successfully");
		assertNotNull(applicationContext, "Application context should not be null");
	}

	@Test
	public void applicationContextContainsExpectedBeans() {
		// Verify that key beans are loaded in the application context
		assertTrue(applicationContext.containsBean("operatorRepository"), "OperatorRepository bean should be present");
		assertTrue(applicationContext.containsBean("operatorService"), "OperatorService bean should be present");
		assertTrue(applicationContext.containsBean("authController"), "AuthController bean should be present");
	}

}
