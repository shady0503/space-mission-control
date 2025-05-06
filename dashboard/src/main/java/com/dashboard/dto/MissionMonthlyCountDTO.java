// com/dashboard/dto/MissionMonthlyCountDTO.java
package com.dashboard.dto;

import java.time.LocalDateTime;

public class MissionMonthlyCountDTO {
    private LocalDateTime month;
    private Long count;

    public MissionMonthlyCountDTO() {
    }

    public MissionMonthlyCountDTO(LocalDateTime month, Long count) {
        this.month = month;
        this.count = count;
    }

    public LocalDateTime getMonth() {
        return month;
    }

    public void setMonth(LocalDateTime month) {
        this.month = month;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}
