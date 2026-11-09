import { 
  GardenZone, 
  DashboardStats, 
  IrrigationLog, 
  IrrigationSchedule, 
  AIRecommendation, 
  CurrentWeather, 
  DailyForecast 
} from '../types';

const API_BASE = '/api';

export const api = {
  // --- Dashboard ---
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // --- Zones ---
  getZones: async (): Promise<GardenZone[]> => {
    const res = await fetch(`${API_BASE}/zones`);
    if (!res.ok) throw new Error('Failed to fetch zones');
    return res.json();
  },

  getZone: async (id: number): Promise<GardenZone> => {
    const res = await fetch(`${API_BASE}/zones/${id}`);
    if (!res.ok) throw new Error('Failed to fetch zone');
    return res.json();
  },

  createZone: async (data: Partial<GardenZone>): Promise<GardenZone> => {
    const res = await fetch(`${API_BASE}/zones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create zone');
    return res.json();
  },

  updateZone: async (id: number, data: Partial<GardenZone>): Promise<GardenZone> => {
    const res = await fetch(`${API_BASE}/zones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update zone');
    return res.json();
  },

  deleteZone: async (id: number): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/zones/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete zone');
    return res.json();
  },

  // --- Valves & Manual Control ---
  openValve: async (zoneId: number, durationMinutes: number = 10) => {
    const res = await fetch(`${API_BASE}/zones/${zoneId}/valve/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration_minutes: durationMinutes }),
    });
    if (!res.ok) throw new Error('Failed to open valve');
    return res.json();
  },

  closeValve: async (zoneId: number) => {
    const res = await fetch(`${API_BASE}/zones/${zoneId}/valve/close`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to close valve');
    return res.json();
  },

  emergencyStop: async () => {
    const res = await fetch(`${API_BASE}/zones/valve/emergency-stop`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to execute emergency shutoff');
    return res.json();
  },

  // --- AI Scheduling Engine ---
  getSchedules: async (): Promise<IrrigationSchedule[]> => {
    const res = await fetch(`${API_BASE}/schedules`);
    if (!res.ok) throw new Error('Failed to fetch schedules');
    return res.json();
  },

  runOptimizer: async () => {
    const res = await fetch(`${API_BASE}/schedules/run-optimizer`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to run AI optimizer');
    return res.json();
  },

  // --- Analytics & Logs ---
  getSensorTrends: async () => {
    const res = await fetch(`${API_BASE}/analytics/sensor-trends`);
    if (!res.ok) throw new Error('Failed to fetch sensor trends');
    return res.json();
  },

  getWaterUsage: async () => {
    const res = await fetch(`${API_BASE}/analytics/water-usage`);
    if (!res.ok) throw new Error('Failed to fetch water usage');
    return res.json();
  },

  getLogs: async (): Promise<IrrigationLog[]> => {
    const res = await fetch(`${API_BASE}/logs`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    return res.json();
  },

  // --- AI Recommendations ---
  getRecommendations: async (): Promise<AIRecommendation[]> => {
    const res = await fetch(`${API_BASE}/recommendations`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  resolveRecommendation: async (id: number) => {
    const res = await fetch(`${API_BASE}/recommendations/${id}/resolve`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to resolve recommendation');
    return res.json();
  },

  // --- Weather ---
  getCurrentWeather: async (): Promise<CurrentWeather> => {
    const res = await fetch(`${API_BASE}/weather/current`);
    if (!res.ok) throw new Error('Failed to fetch current weather');
    return res.json();
  },

  getForecast: async (): Promise<DailyForecast[]> => {
    const res = await fetch(`${API_BASE}/weather/forecast`);
    if (!res.ok) throw new Error('Failed to fetch forecast');
    return res.json();
  },

  // --- AI Chat Assistant ---
  chatWithAgent: async (message: string) => {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Failed to chat with AI');
    return res.json();
  },

  // --- IoT Simulator Controls ---
  toggleSimulator: async () => {
    const res = await fetch(`${API_BASE}/iot/simulator/toggle`, { method: 'POST' });
    return res.json();
  },

  toggleSimulatorRain: async () => {
    const res = await fetch(`${API_BASE}/iot/simulator/rain`, { method: 'POST' });
    return res.json();
  },

  toggleSimulatorHeatwave: async () => {
    const res = await fetch(`${API_BASE}/iot/simulator/heatwave`, { method: 'POST' });
    return res.json();
  },

  resetSensors: async () => {
    const res = await fetch(`${API_BASE}/iot/simulator/reset`, { method: 'POST' });
    return res.json();
  },
};

