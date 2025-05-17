// src/main/java/microservices/mission_service/dto/MissionMonthlyCount.java
package microservices.mission_service.dto;

import java.time.LocalDateTime;

public interface MissionMonthlyCount {
    LocalDateTime getMonth();
    Long getCount();
}
