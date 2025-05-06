package com.entreprise.dto;

/**
 * DTO for Spacecraft service aggregation.
 */
public class SpacecraftDto {
    private Long id;
    private String name;
    private String model;

    public SpacecraftDto() {}

    public SpacecraftDto(Long id, String name, String model) {
        this.id = id;
        this.name = name;
        this.model = model;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }
}
