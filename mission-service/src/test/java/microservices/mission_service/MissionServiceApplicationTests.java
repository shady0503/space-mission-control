package microservices.mission_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class MissionServiceApplicationTests {

	@MockBean
	private KafkaTemplate<String, Object> kafkaTemplate;

	@Test
	void contextLoads() {
		// This test verifies that the Spring application context loads successfully
		// with H2 database configuration
	}

}
