package com.entreprise.service;// src/main/java/microservices/enterprise_service/service/EnterpriseService.java


import com.entreprise.model.Enterprise;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EnterpriseService {

    /**
     * Create a new enterprise with the given name.
     * @param name the enterprise name
     * @return the created Enterprise
     */
    Enterprise createEnterprise(String name);

    /**
     * Fetch an enterprise by its UUID.
     * @param id the enterprise UUID
     * @return an Optional containing the Enterprise if found
     */
    Optional<Enterprise> getEnterpriseById(UUID id);

    /**
     * List all enterprises.
     * @return list of all Enterprise entities
     */
    List<Enterprise> getAllEnterprises();

    /**
     * Find an enterprise by its exact name.
     * @param name the enterprise name
     * @return an Optional containing the Enterprise if found
     */
    Optional<Enterprise> getEnterpriseByName(String name);

    /**
     * Update the name of an existing enterprise.
     * @param id the enterprise UUID
     * @param newName the new name
     * @return the updated Enterprise
     * @throws IllegalArgumentException if no enterprise with given ID exists
     */
    Enterprise updateEnterprise(UUID id, String newName);

    /**
     * Delete an enterprise by its UUID.
     * @param id the enterprise UUID
     */
    void deleteEnterprise(UUID id);
}
