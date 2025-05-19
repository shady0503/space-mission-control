export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080',
  WS_BASE_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
  ENDPOINTS: {
    AUTH: {
      SIGNIN: '/api/auth/signin',
      SIGNUP: '/api/auth/signup',
    },
    TELEMETRY: {
      BASE: '/api/telemetry',
      LIVE: '/ws/telemetry',
    },
    MISSIONS: {
      BASE: '/api/missions',
      BY_ENTERPRISE: '/api/missions/enterprise/{enterpriseId}',
      BY_OPERATOR: '/api/missions/operator/{operatorId}',
      GET_ONE: '/api/missions/{missionId}',
      UPDATE: '/api/missions/{missionId}', // via PUT
      DELETE: '/api/missions/{missionId}', // via DELETE
      UPSERT_OPERATOR: '/api/missions/{missionId}/operators',
    },
    SPACECRAFT: {
      BASE: '/api/spacecraft',
      GET_ONE: '/api/spacecraft/{id}',
      BY_ENTERPRISE: '/api/spacecraft/enterprise',
      BY_MISSION: '/api/spacecraft/mission/{missionId}',
      BY_EXTERNAL_ID: '/api/spacecraft/externalId/',
      EXISTS: '/api/spacecraft/',
      SUMMARY: '/api/spacecraft/summary',
      MISSION: '/api/spacecraft/mission',
    },
    COMMANDS: {
      BASE: '/api/commands',
      GET_ONE: '/api/commands/{id}',
      COUNT_PENDING: '/api/commands/count/pending',
      COUNT_SUCCESS: '/api/commands/count/successful',
      COUNT_TYPE: '/api/commands/count/type',
      COUNT_OPERATOR: '/api/commands/count/operator',
    },
    OPERATOR: {
      CURRENT: '/api/operator/current',
      BY_ID: '/api/operator/{id}',
      BY_ENTERPRISE: '/api/operator/enterprise',
      BY_MISSION: '/api/operator/mission/{id}',
      UPDATE_PROFILE: '/api/operator', // via PUT
      UPDATE_ROLE: '/api/operator/update-role', // via PUT
      REMOVE_FROM_MISSION: '/api/operator/remove/{missionId}/{operatorId}', // via DELETE
      SEARCH: '/api/operator/search',
      ADD_TO_ENTERPRISE: '/api/operator/addToEnterprise', // via POST @RequestParam "enterpriseId", "operatorId"
    },
    DASHBOARD: {
      SUMMARY: '/api/dashboard/summary',
      MISSION_STATS: '/api/dashboard/missions/stats',
      SPACECRAFT_STATS: '/api/dashboard/spacecraft/stats',
      COMMAND_STATS: '/api/dashboard/commands/stats',
      RECENT_ACTIVITY: '/api/dashboard/activity/recent',
      TELEMETRY_SUMMARY: '/api/dashboard/telemetry/summary',
    },
    ENTERPRISE: {
      BASE: '/api/enterprise',
      GET_ONE: '/api/enterprise/{id}',
      GET_ALL: '/api/enterprise/',
      CREATE: '/api/enterprise', // via POST
      UPDATE: '/api/enterprise/{id}', // via PUT
      DELETE: '/api/enterprise/{id}',
      OPERATORS: '/api/enterprise/{id}/operators',
      SPACECRAFT: '/api/enterprise/{id}/spacecraft',
      MISSIONS: '/api/enterprise/{id}/missions',
    },
    VISUALIZATION: {
      LATEST: '/api/visualization/{externalId}/latest',
      TIMESERIES: '/api/visualization/{externalId}/timeseries',
      MULTI_TIMESERIES: '/api/visualization/{externalId}/multi-timeseries',
      TRAJECTORY: '/api/visualization/{externalId}/trajectory',
      TRAJECTORY_PREDICTION: '/api/visualization/{externalId}/trajectory-with-prediction',
      STATISTICS: '/api/visualization/{externalId}/statistics',
    },
  },
  TIMEOUT: 10000,
};