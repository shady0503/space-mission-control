package microservices.auth_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import microservices.auth_service.model.Operator;

@DataJpaTest
@ActiveProfiles("test")
class OperatorRepositoryTest {

    @Autowired
    private OperatorRepository operatorRepository;

    @Test
    void shouldSaveAndFindOperator() {
        // Given
        Operator operator = new Operator();
        operator.setUsername("testuser");
        operator.setEmail("test@example.com");
        operator.setHashedPassword("hashedpassword123");
        operator.setEnterpriseId(UUID.randomUUID());

        // When
        Operator saved = operatorRepository.save(operator);

        // Then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getUsername()).isEqualTo("testuser");
        assertThat(saved.getEmail()).isEqualTo("test@example.com");
    }

    @Test
    void shouldFindByUsername() {
        // Given
        Operator operator = new Operator();
        operator.setUsername("findme");
        operator.setEmail("findme@example.com");
        operator.setHashedPassword("password123");
        operatorRepository.save(operator);

        // When
        Optional<Operator> found = operatorRepository.findByUsername("findme");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("findme@example.com");
    }

    @Test
    void shouldFindByEmail() {
        // Given
        Operator operator = new Operator();
        operator.setUsername("emailtest");
        operator.setEmail("email@test.com");
        operator.setHashedPassword("password123");
        operatorRepository.save(operator);

        // When
        Optional<Operator> found = operatorRepository.findByEmail("email@test.com");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("emailtest");
    }

    @Test
    void shouldFindByEnterpriseId() {
        // Given
        UUID enterpriseId = UUID.randomUUID();

        Operator operator1 = new Operator();
        operator1.setUsername("user1");
        operator1.setEmail("user1@example.com");
        operator1.setHashedPassword("password123");
        operator1.setEnterpriseId(enterpriseId);

        Operator operator2 = new Operator();
        operator2.setUsername("user2");
        operator2.setEmail("user2@example.com");
        operator2.setHashedPassword("password123");
        operator2.setEnterpriseId(enterpriseId);

        operatorRepository.save(operator1);
        operatorRepository.save(operator2);

        // When
        List<Operator> operators = operatorRepository.findByEnterpriseId(enterpriseId);

        // Then
        assertThat(operators).hasSize(2);
        assertThat(operators).extracting(Operator::getEnterpriseId)
                .containsOnly(enterpriseId);
    }

    @Test
    void shouldCountOperatorsByEnterpriseId() {
        // Given
        UUID enterpriseId = UUID.randomUUID();

        Operator operator1 = new Operator();
        operator1.setUsername("count1");
        operator1.setEmail("count1@example.com");
        operator1.setHashedPassword("password123");
        operator1.setEnterpriseId(enterpriseId);

        Operator operator2 = new Operator();
        operator2.setUsername("count2");
        operator2.setEmail("count2@example.com");
        operator2.setHashedPassword("password123");
        operator2.setEnterpriseId(enterpriseId);

        operatorRepository.save(operator1);
        operatorRepository.save(operator2);

        // When
        Long count = operatorRepository.countOperatorByEnterpriseId(enterpriseId);

        // Then
        assertThat(count).isEqualTo(2L);
    }

    @Test
    void shouldReturnEmptyWhenUsernameNotFound() {
        // When
        Optional<Operator> found = operatorRepository.findByUsername("nonexistent");

        // Then
        assertThat(found).isEmpty();
    }
}