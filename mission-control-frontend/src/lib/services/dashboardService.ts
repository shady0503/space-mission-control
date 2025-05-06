// services/dashboardService.ts – correctly uses user.id
import apiClient from "../api/apiClient";
import { API_CONFIG } from "../api/config";

/* ──────────────────────────────────────────────────────────── *
 *  Type Defs (unchanged except where noted)
 * ──────────────────────────────────────────────────────────── */
export interface DashboardSummary {
  activeMissionCount: number;
  totalSpacecraftCount: number;
  activeOperatorCount: number;
  pendingCommandCount: number;
  recentAlertCount: number;
}

/* … (MissionStats, SpacecraftStats, CommandStats, RecentActivity, TelemetrySummary) … */

export interface DashboardData {
  summary: DashboardSummary | null;
  missionStats: MissionStats | null;
  spacecraftStats: SpacecraftStats | null;
  commandStats: CommandStats | null;
  recentActivity: RecentActivity | null;
  telemetrySummary: TelemetrySummary | null;
  lastUpdated: Date | null;
}

/* ──────────────────────────────────────────────────────────── *
 *  Local cache & helpers
 * ──────────────────────────────────────────────────────────── */
let dashboardCache: Record<string, DashboardData> = {}; // keyed by userId
const pending: Record<string, Promise<any>> = {}; // pending requests

const cacheTTL = 30_000; // 30 s for single endpoints
const batchTTL = 120_000; // 2 min for fetchAll

function key(userId: string, scope: string) {
  return `${userId}:${scope}`;
}

function params(userId?: string, extra?: Record<string, unknown>) {
  return { ...(extra || {}), ...(userId ? { operatorId: userId } : {}) };
}

/* ──────────────────────────────────────────────────────────── *
 *  Public API
 * ──────────────────────────────────────────────────────────── */
export const dashboardService = {
  /* ░░░░░░░░░░░░░░ 1. Batch fetch ░░░░░░░░░░░░░░ */
  async fetchAllData(userData: {
    id?: string;
    enterpriseId?: string;
  }): Promise<DashboardData> {
    const userId = userData?.id || "";
    const k = key(userId, "fetchAll");
    const cached = dashboardCache[userId];
    const fresh =
      cached &&
      cached.lastUpdated &&
      Date.now() - cached.lastUpdated.getTime() < batchTTL;
    if (fresh) return cached!;
    if (pending[k]) return pending[k];

    const p = Promise.all([
      this.getSummary(userId),
      this.getMissionStats(userId),
      this.getSpacecraftStats(userId),
      this.getCommandStats(userId),
      // this.getRecentActivity(userId, 10),
      this.getTelemetrySummary(userId), // Use userId for the API call
    ])
      .then(
        ([
          summary,
          missionStats,
          spacecraftStats,
          commandStats,
          /*recentActivity,*/ telemetrySummary,
        ]) => {
          const data: DashboardData = {
            summary,
            missionStats,
            spacecraftStats,
            commandStats,
            recentActivity: null /*recentActivity*/,
            telemetrySummary,
            lastUpdated: new Date(),
          };
          dashboardCache[userId] = data;
          delete pending[k];
          return data;
        }
      )
      .catch((err) => {
        delete pending[k];
        throw err;
      });

    pending[k] = p;
    return p;
  },

  clearCache(userId?: string) {
    if (userId) delete dashboardCache[userId];
    else dashboardCache = {};
  },

  /* ░░░░░░░░░░░░░ 2. Individual endpoints ░░░░░░░░░░░░░ */
  async getSummary(userId: string): Promise<DashboardSummary> {
    const k = key(userId, "summary");
    const cached = dashboardCache[userId]?.summary;
    const fresh =
      cached &&
      dashboardCache[userId].lastUpdated &&
      Date.now() - dashboardCache[userId].lastUpdated!.getTime() < cacheTTL;
    if (fresh) return cached!;
    if (pending[k]) return pending[k];

    const p = apiClient
      .get<DashboardSummary>(API_CONFIG.ENDPOINTS.DASHBOARD.SUMMARY, {
        params: params(userId),
      })
      .then((r) => {
        dashboardCache[userId] = {
          ...(dashboardCache[userId] || {}),
          summary: r,
          lastUpdated: new Date(),
        };
        delete pending[k];
        return r;
      })
      .catch((e) => {
        delete pending[k];
        throw e;
      });

    pending[k] = p;
    return p;
  },

  async getMissionStats(userId: string): Promise<MissionStats> {
    const k = key(userId, "missionStats");
    if (pending[k]) return pending[k];

    const cached = dashboardCache[userId]?.missionStats;
    const fresh =
      cached &&
      dashboardCache[userId].lastUpdated &&
      Date.now() - dashboardCache[userId].lastUpdated!.getTime() < cacheTTL;
    if (fresh) return cached!;

    const p = apiClient
      .get<MissionStats>(API_CONFIG.ENDPOINTS.DASHBOARD.MISSION_STATS, {
        params: params(userId),
      })
      .then((r) => {
        dashboardCache[userId] = {
          ...(dashboardCache[userId] || {}),
          missionStats: r,
          lastUpdated: new Date(),
        };
        delete pending[k];
        return r;
      })
      .catch((e) => {
        delete pending[k];
        throw e;
      });

    pending[k] = p;
    return p;
  },

  async getSpacecraftStats(userId: string): Promise<SpacecraftStats> {
    const k = key(userId, "spacecraftStats");
    if (pending[k]) return pending[k];

    const cached = dashboardCache[userId]?.spacecraftStats;
    const fresh =
      cached &&
      dashboardCache[userId].lastUpdated &&
      Date.now() - dashboardCache[userId].lastUpdated!.getTime() < cacheTTL;
    if (fresh) return cached!;

    const p = apiClient
      .get<SpacecraftStats>(API_CONFIG.ENDPOINTS.DASHBOARD.SPACECRAFT_STATS, {
        params: params(userId),
      })
      .then((r) => {
        dashboardCache[userId] = {
          ...(dashboardCache[userId] || {}),
          spacecraftStats: r,
          lastUpdated: new Date(),
        };
        delete pending[k];
        return r;
      })
      .catch((e) => {
        delete pending[k];
        throw e;
      });

    pending[k] = p;
    return p;
  },

  async getCommandStats(userId: string): Promise<CommandStats> {
    const k = key(userId, "commandStats");
    if (pending[k]) return pending[k];

    const cached = dashboardCache[userId]?.commandStats;
    const fresh =
      cached &&
      dashboardCache[userId].lastUpdated &&
      Date.now() - dashboardCache[userId].lastUpdated!.getTime() < cacheTTL;
    if (fresh) return cached!;

    const p = apiClient
      .get<CommandStats>(API_CONFIG.ENDPOINTS.DASHBOARD.COMMAND_STATS, {
        params: params(userId),
      })
      .then((r) => {
        dashboardCache[userId] = {
          ...(dashboardCache[userId] || {}),
          commandStats: r,
          lastUpdated: new Date(),
        };
        delete pending[k];
        return r;
      })
      .catch((e) => {
        delete pending[k];
        throw e;
      });

    pending[k] = p;
    return p;
  },

  async getTelemetrySummary(
    enterpriseId: string
  ): Promise<TelemetrySummary> {
    const cacheKey = `telemetry_summary_${enterpriseId}`;
  
    // return cache if still fresh
    const cached = dashboardCache[enterpriseId]?.telemetrySummary;
    const fresh  =
      cached &&
      dashboardCache[enterpriseId].lastUpdated &&
      Date.now() - dashboardCache[enterpriseId].lastUpdated!.getTime() < cacheTTL;
    if (fresh) {
      return cached;
    }
  
    // hit the API
    const summary = await apiClient.get<TelemetrySummary>(
      API_CONFIG.ENDPOINTS.DASHBOARD.TELEMETRY_SUMMARY,
      { params: { enterpriseId } }
    );
  
    // stash in cache
    dashboardCache[enterpriseId] = {
      ...(dashboardCache[enterpriseId] || {}),
      telemetrySummary: summary,
      lastUpdated: new Date(),
    };
  
    return summary;
  }
  
};

export default dashboardService;
