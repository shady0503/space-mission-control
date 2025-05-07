package com.entreprise.repository;// src/main/java/microservices/enterprise_service/repository/EnterpriseRepository.java

import com.entreprise.model.Enterprise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Enterprise} entities.
 */
@Repository
public interface EnterpriseRepository extends JpaRepository<Enterprise, UUID> {

    /**
     * Find an enterprise by its exact name.
     *
     * @param name the enterprise name
     * @return an Optional containing the Enterprise if found, or empty otherwise
     */
    Optional<Enterprise> findByName(String name);
}
