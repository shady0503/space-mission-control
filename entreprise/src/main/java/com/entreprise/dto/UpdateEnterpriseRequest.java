package com.entreprise.dto;

/**
 * Request payload for updating an enterprise.
 */
public class UpdateEnterpriseRequest {
    private String name;

    public UpdateEnterpriseRequest() {}
    public UpdateEnterpriseRequest(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
