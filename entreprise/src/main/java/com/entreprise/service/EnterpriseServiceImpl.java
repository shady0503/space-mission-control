package com.entreprise.service;// src/main/java/microservices/enterprise_service/service/EnterpriseServiceImpl.java

import com.entreprise.model.Enterprise;
import com.entreprise.repository.EnterpriseRepository;
import com.entreprise.service.EnterpriseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EnterpriseServiceImpl implements EnterpriseService {

    private final EnterpriseRepository repository;

    public EnterpriseServiceImpl(EnterpriseRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Enterprise createEnterprise(String name) {
        Enterprise enterprise = new Enterprise();
        enterprise.setName(name);
        return repository.save(enterprise);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Enterprise> getEnterpriseById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Enterprise> getAllEnterprises() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Enterprise> getEnterpriseByName(String name) {
        return repository.findByName(name);
    }

    @Override
    @Transactional
    public Enterprise updateEnterprise(UUID id, String newName) {
        Enterprise enterprise = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Enterprise not found: " + id));
        enterprise.setName(newName);
        return repository.save(enterprise);
    }

    @Override
    @Transactional
    public void deleteEnterprise(UUID id) {
        repository.deleteById(id);
    }
}
