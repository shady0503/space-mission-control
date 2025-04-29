package com.entreprise.dto;

/**
 * Request payload for creating an enterprise.
 */
public class CreateEnterpriseRequest {
    private String name;

    public CreateEnterpriseRequest() {}
    public CreateEnterpriseRequest(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
