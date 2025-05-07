// RecentActivityDTO.java
package com.dashboard.dto;

import java.util.List;

public class RecentActivityDTO {
    private List<ActivityLogDTO> recentActivities;

    public List<ActivityLogDTO> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<ActivityLogDTO> recentActivities) {
        this.recentActivities = recentActivities;
    }
}

