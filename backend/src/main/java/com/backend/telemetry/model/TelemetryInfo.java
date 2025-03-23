package com.backend.telemetry.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TelemetryInfo {

    @JsonProperty("satname")
    private String satName;

    @JsonProperty("satid")
    private String satId;

    @JsonProperty("transactionscount")
    private Long transactionsCount;

    // No-arg constructor
    public TelemetryInfo() {
    }

    public TelemetryInfo(String satName, String satId, Long transactionsCount) {
        this.satName = satName;
        this.satId = satId;
        this.transactionsCount = transactionsCount;
    }

    public String getSatName() {
        return satName;
    }

    public void setSatName(String satName) {
        this.satName = satName;
    }

    public String getSatId() {
        return satId;
    }

    public void setSatId(String satId) {
        this.satId = satId;
    }

    public Long getTransactionsCount() {
        return transactionsCount;
    }

    public void setTransactionsCount(Long transactionsCount) {
        this.transactionsCount = transactionsCount;
    }
}
