package com.entreprise;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class EntrepriseApplicationTests {

	// Mock external clients to avoid dependencies during context loading
	@MockBean
	private com.entreprise.client.OperatorClient operatorClient;

	@MockBean
	private com.entreprise.client.MissionClient missionClient;

	@MockBean
	private com.entreprise.client.SpacecraftClient spacecraftClient;

	@Test
	void contextLoads() {
		// This test ensures that the Spring application context loads successfully
	}

}
