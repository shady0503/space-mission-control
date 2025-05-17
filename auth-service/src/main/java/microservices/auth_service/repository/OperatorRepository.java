// src/main/java/com/yourorg/auth/repository/OperatorRepository.java
package microservices.auth_service.repository;

import microservices.auth_service.model.Operator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;


@Repository
public interface OperatorRepository extends JpaRepository<Operator, UUID> {
    Optional<Operator> findByUsername(String username);
    Optional<Operator> findByEmail(String email);
    List<Operator> findByEnterpriseId(UUID enterpriseId);

    Long countOperatorByEnterpriseId(UUID enterpriseId);
}
