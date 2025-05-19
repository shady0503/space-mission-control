package microservices.auth_service.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
public class MissionClientFallbackFactory implements FallbackFactory<MissionClient> {
    private static final Logger logger = LoggerFactory.getLogger(MissionClientFallbackFactory.class);

    @Override
    public MissionClient create(Throwable cause) {
        return new MissionClient() {
            @Override
            public List<MissionDto> getAllMissions() {
                logger.error("Failed to get all missions", cause);
                return Collections.emptyList();
            }

            @Override
            public MissionDto getMissionById(UUID id) {
                logger.error("Failed to get mission with id: {}", id, cause);
                return null;
            }

            @Override
            public MissionDto createMission(String authorization, CreateMissionRequest request, UUID operatorId) {
                logger.error("MissionClient fallback: failed to create mission for operator {}: {}", operatorId, cause.getMessage());
                throw new IllegalStateException("Mission service is currently unavailable");
            }

            @Override
            public MissionDto updateMission(UUID id, UpdateMissionRequest req) {
                logger.error("Failed to update mission with id: {}", id, cause);
                return null;
            }

            @Override
            public void deleteMission(UUID id) {
                logger.error("Failed to delete mission with id: {}", id, cause);
            }

            @Override
            public List<MissionDto> getMissionsForOperator(UUID operatorId) {
                logger.error("Failed to get missions for operator with id: {}", operatorId, cause);
                return Collections.emptyList();
            }

            @Override
            public MissionOperatorDto updateOperatorRole(UUID missionId, UUID operatorId, UpdateOperatorRoleRequest request) {
                return null;
            }
        };
    }
}