import React from 'react';
import { 
  CloudRain, 
  Thermometer, 
  Droplets, 
  AlertOctagon, 
  Wifi, 
  WifiOff,
  Bell
} from 'lucide-react';
import { CurrentWeather } from '../../types';

interface HeaderProps {
  currentTab: string;
  weather: CurrentWeather | null;
  wsConnected: boolean;
  onEmergencyStop: () => void;
  activeAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  weather,
  wsConnected,
  onEmergencyStop,
  activeAlertsCount,
}) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard': return { title: 'Campus Garden Dashboard', subtitle: 'Real-time telemetry, soil moisture analytics & smart irrigation overview' };
      case 'zones': return { title: 'Garden Zone Management', subtitle: 'Configure plant species, soil thresholds, and microclimate parameters' };
      case 'agent': return { title: 'AI Irrigation Scheduling Agent', subtitle: 'Predictive FAO-56 evapotranspiration & weather-aware scheduling engine' };
      case 'assistant': return { title: 'AI Garden Assistant', subtitle: 'Conversational agronomic intelligence & automated system reports' };
      case 'manual': return { title: 'Manual Valve Control Panel', subtitle: 'Direct solenoid override with safety auto-shutoff timers' };
      case 'weather': return { title: 'Campus Weather Station', subtitle: 'Hyperlocal microclimate, solar radiation & rainfall probability' };
      case 'iot': return { title: 'IoT Hardware & Live Simulator', subtitle: 'ESP32 microcontroller integration & virtual environment sandbox' };
      case 'analytics': return { title: 'Water Analytics & Logs', subtitle: 'Historical water conservation metrics and irrigation event logs' };
      default: return { title: 'Smart Irrigation Agent', subtitle: 'Campus Garden Management System' };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Weather Snapshot */}
        {weather && (
          <div className="hidden lg:flex items-center gap-4 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5 text-amber-700">
              <Thermometer className="w-4 h-4 text-amber-500" />
              <span>{weather.temperature}°C</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-1.5 text-blue-700">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span>{weather.humidity}% Hum</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-1.5 text-indigo-700">
              <CloudRain className="w-4 h-4 text-indigo-500" />
              <span>{weather.rain_probability}% Rain</span>
            </div>
          </div>
        )}

        {/* Live WebSocket Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
          wsConnected 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {wsConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Live Sync</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Polling</span>
            </>
          )}
        </div>

        {/* Emergency Master Shutoff Button */}
        <button
          onClick={onEmergencyStop}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
          title="Emergency Master Shutoff - Close all active valves immediately"
        >
          <AlertOctagon className="w-4 h-4 text-rose-600" />
          <span className="hidden sm:inline">Emergency Shutoff</span>
        </button>

        {/* Notification Alert Icon */}
        <div className="relative">
          <div className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition cursor-pointer">
            <Bell className="w-4.5 h-4.5" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {activeAlertsCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

