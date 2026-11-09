import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { StatsOverview } from './components/dashboard/StatsOverview';
import { AIStatusSummary } from './components/dashboard/AIStatusSummary';
import { MoistureChart } from './components/dashboard/MoistureChart';
import { TempHumidityChart } from './components/dashboard/TempHumidityChart';
import { WaterConsumptionChart } from './components/dashboard/WaterConsumptionChart';
import { ZoneQuickGrid } from './components/dashboard/ZoneQuickGrid';
import { RecentActivityTable } from './components/dashboard/RecentActivityTable';
import { ZoneManagement } from './components/zones/ZoneManagement';
import { ZoneDetailModal } from './components/zones/ZoneDetailModal';
import { AIAgentView } from './components/agent/AIAgentView';
import { AIChatAssistant } from './components/assistant/AIChatAssistant';
import { ManualControls } from './components/manual/ManualControls';
import { WeatherView } from './components/weather/WeatherView';
import { IoTSimulatorView } from './components/iot/IoTSimulatorView';
import { AnalyticsView } from './components/analytics/AnalyticsView';

import { api } from './services/api';
import { 
  GardenZone, 
  DashboardStats, 
  IrrigationSchedule, 
  IrrigationLog, 
  CurrentWeather, 
  DailyForecast 
} from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [zones, setZones] = useState<GardenZone[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [logs, setLogs] = useState<IrrigationLog[]>([]);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [sensorTrends, setSensorTrends] = useState<any[]>([]);
  const [waterUsage, setWaterUsage] = useState<any[]>([]);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [inspectingZone, setInspectingZone] = useState<GardenZone | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [
        fetchedZones, 
        fetchedStats, 
        fetchedSchedules, 
        fetchedLogs, 
        fetchedWeather, 
        fetchedForecast, 
        fetchedTrends, 
        fetchedUsage
      ] = await Promise.allSettled([
        api.getZones(),
        api.getDashboardStats(),
        api.getSchedules(),
        api.getLogs(),
        api.getCurrentWeather(),
        api.getForecast(),
        api.getSensorTrends(),
        api.getWaterUsage(),
      ]);

      if (fetchedZones.status === 'fulfilled') setZones(fetchedZones.value);
      if (fetchedStats.status === 'fulfilled') setStats(fetchedStats.value);
      if (fetchedSchedules.status === 'fulfilled') setSchedules(fetchedSchedules.value);
      if (fetchedLogs.status === 'fulfilled') setLogs(fetchedLogs.value);
      if (fetchedWeather.status === 'fulfilled') setWeather(fetchedWeather.value);
      if (fetchedForecast.status === 'fulfilled') setForecast(fetchedForecast.value);
      if (fetchedTrends.status === 'fulfilled') setSensorTrends(fetchedTrends.value);
      if (fetchedUsage.status === 'fulfilled') setWaterUsage(fetchedUsage.value);
    } catch (e) {
      console.error('Initial fetch failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // WebSocket real-time connection
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'SENSOR_TICK' && msg.zones) {
            setZones((prev) =>
              prev.map((zone) => {
                const update = msg.zones.find((u: any) => u.id === zone.id);
                if (update) {
                  return {
                    ...zone,
                    soil_moisture: update.moisture,
                    temperature: update.temperature,
                    humidity: update.humidity,
                    valve_state: update.valve_state,
                  };
                }
                return zone;
              })
            );
          } else if (msg.type === 'VALVE_STATE_CHANGED') {
            setZones((prev) =>
              prev.map((zone) => {
                if (zone.id === msg.zone_id) {
                  return { ...zone, valve_state: msg.valve_state };
                }
                return zone;
              })
            );
            // Refresh logs and stats
            api.getLogs().then(setLogs).catch(() => {});
            api.getDashboardStats().then(setStats).catch(() => {});
          } else if (msg.type === 'EMERGENCY_STOP') {
            setZones((prev) => prev.map((z) => ({ ...z, valve_state: 'CLOSED' })));
            api.getDashboardStats().then(setStats).catch(() => {});
          }
        } catch (err) {
          console.error('WS message error:', err);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWs, 3000);
      };

      ws.onerror = () => {
        ws?.close();
      };
    };

    connectWs();

    // Periodic polling backup (every 10s)
    const pollInterval = setInterval(() => {
      api.getZones().then(setZones).catch(() => {});
      api.getDashboardStats().then(setStats).catch(() => {});
    }, 10000);

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
      clearInterval(pollInterval);
    };
  }, []);

  // --- Handlers ---
  const handleToggleValve = async (zone: GardenZone) => {
    try {
      if (zone.valve_state === 'OPEN') {
        await api.closeValve(zone.id);
        setZones((prev) =>
          prev.map((z) => (z.id === zone.id ? { ...z, valve_state: 'CLOSED' } : z))
        );
      } else {
        await api.openValve(zone.id, 10);
        setZones((prev) =>
          prev.map((z) => (z.id === zone.id ? { ...z, valve_state: 'OPEN' } : z))
        );
      }
      const updatedLogs = await api.getLogs();
      setLogs(updatedLogs);
    } catch (err) {
      console.error('Failed to toggle valve:', err);
    }
  };

  const handleEmergencyStop = async () => {
    try {
      await api.emergencyStop();
      setZones((prev) => prev.map((z) => ({ ...z, valve_state: 'CLOSED' })));
      const updatedStats = await api.getDashboardStats();
      setStats(updatedStats);
      const updatedLogs = await api.getLogs();
      setLogs(updatedLogs);
    } catch (err) {
      console.error('Emergency stop error:', err);
    }
  };

  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    try {
      await api.runOptimizer();
      const [updatedSchedules, updatedStats, updatedZones] = await Promise.all([
        api.getSchedules(),
        api.getDashboardStats(),
        api.getZones(),
      ]);
      setSchedules(updatedSchedules);
      setStats(updatedStats);
      setZones(updatedZones);
    } catch (err) {
      console.error('Optimizer error:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAddZone = async (data: Partial<GardenZone>) => {
    const newZone = await api.createZone(data);
    setZones((prev) => [...prev, newZone]);
    const updatedStats = await api.getDashboardStats();
    setStats(updatedStats);
  };

  const handleEditZone = async (id: number, data: Partial<GardenZone>) => {
    const updated = await api.updateZone(id, data);
    setZones((prev) => prev.map((z) => (z.id === id ? updated : z)));
  };

  const handleDeleteZone = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this garden zone?')) {
      await api.deleteZone(id);
      setZones((prev) => prev.filter((z) => z.id !== id));
      const updatedStats = await api.getDashboardStats();
      setStats(updatedStats);
    }
  };

  const activeValvesCount = zones.filter((z) => z.valve_state === 'OPEN').length;

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeValvesCount={activeValvesCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          weather={weather}
          wsConnected={wsConnected}
          onEmergencyStop={handleEmergencyStop}
          activeAlertsCount={stats?.active_alerts_count || 0}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: DASHBOARD */}
          {currentTab === 'dashboard' && stats && (
            <div className="space-y-6">
              {/* AI Status Banner */}
              <AIStatusSummary
                summary={stats.ai_garden_health_summary}
                onRunOptimizer={handleRunOptimizer}
                isOptimizing={isOptimizing}
              />

              {/* KPI Cards */}
              <StatsOverview stats={stats} />

              {/* Real-time Zone Quick Grid */}
              <ZoneQuickGrid
                zones={zones}
                onToggleValve={handleToggleValve}
                onInspectZone={(z) => setInspectingZone(z)}
              />

              {/* Interactive Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MoistureChart data={sensorTrends} />
                <TempHumidityChart />
              </div>

              {/* Water Consumption & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <WaterConsumptionChart data={waterUsage} />
                </div>
                <div className="lg:col-span-2">
                  <RecentActivityTable logs={logs} />
                </div>
              </div>
            </div>
          )}

          {/* TAB: GARDEN ZONES */}
          {currentTab === 'zones' && (
            <ZoneManagement
              zones={zones}
              onAddZone={handleAddZone}
              onEditZone={handleEditZone}
              onDeleteZone={handleDeleteZone}
              onToggleValve={handleToggleValve}
            />
          )}

          {/* TAB: AI SCHEDULING AGENT */}
          {currentTab === 'agent' && (
            <AIAgentView
              zones={zones}
              schedules={schedules}
              weather={weather}
              forecast={forecast}
              onRunOptimizer={handleRunOptimizer}
              isOptimizing={isOptimizing}
            />
          )}

          {/* TAB: AI CHAT ASSISTANT */}
          {currentTab === 'assistant' && (
            <AIChatAssistant
              zones={zones}
              onSendMessage={api.chatWithAgent}
            />
          )}

          {/* TAB: MANUAL VALVE CONTROLS */}
          {currentTab === 'manual' && (
            <ManualControls
              zones={zones}
              onOpenValve={api.openValve}
              onCloseValve={api.closeValve}
              onEmergencyStop={handleEmergencyStop}
            />
          )}

          {/* TAB: WEATHER STATION */}
          {currentTab === 'weather' && (
            <WeatherView
              weather={weather}
              forecast={forecast}
            />
          )}

          {/* TAB: IOT & HARDWARE SIMULATOR */}
          {currentTab === 'iot' && (
            <IoTSimulatorView
              zones={zones}
              onToggleSimulator={api.toggleSimulator}
              onTriggerRain={api.toggleSimulatorRain}
              onTriggerHeatwave={api.toggleSimulatorHeatwave}
              onResetSensors={api.resetSensors}
            />
          )}

          {/* TAB: WATER ANALYTICS & LOGS */}
          {currentTab === 'analytics' && (
            <AnalyticsView
              logs={logs}
              waterUsage={waterUsage}
            />
          )}
        </main>
      </div>

      {/* Quick Inspection Modal */}
      <ZoneDetailModal
        zone={inspectingZone}
        onClose={() => setInspectingZone(null)}
        onToggleValve={handleToggleValve}
      />
    </div>
  );
}
export default App;
