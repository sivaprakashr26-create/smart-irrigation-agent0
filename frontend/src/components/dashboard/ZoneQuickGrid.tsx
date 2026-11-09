import React from 'react';
import { 
  Sprout, 
  Droplet, 
  BatteryMedium, 
  Layers, 
  Power, 
  Clock, 
  ArrowUpRight 
} from 'lucide-react';
import { GardenZone } from '../../types';

interface ZoneQuickGridProps {
  zones: GardenZone[];
  onToggleValve: (zone: GardenZone) => void;
  onInspectZone: (zone: GardenZone) => void;
}

export const ZoneQuickGrid: React.FC<ZoneQuickGridProps> = ({
  zones,
  onToggleValve,
  onInspectZone,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">Campus Garden Zones Live Status</h3>
          <p className="text-xs text-slate-500">Continuous IoT telemetry and automated valve state</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {zones.map((zone) => {
          const isOpen = zone.valve_state === 'OPEN';
          const isDry = zone.soil_moisture < zone.min_moisture_threshold;
          const isCritical = zone.soil_moisture < 25;

          let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
          let barColor = 'bg-emerald-500';
          if (isCritical) {
            statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
            barColor = 'bg-rose-500';
          } else if (isDry) {
            statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
            barColor = 'bg-amber-500';
          }

          return (
            <div
              key={zone.id}
              className={`p-4 rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md ${
                isOpen ? 'border-blue-400 ring-2 ring-blue-500/20' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight hover:text-emerald-700 cursor-pointer" onClick={() => onInspectZone(zone)}>
                      {zone.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate max-w-[140px] mt-0.5">
                      {zone.plant_type}
                    </p>
                  </div>
                  <button
                    onClick={() => onInspectZone(zone)}
                    className="p-1 text-slate-450 hover:text-emerald-600 rounded-md hover:bg-slate-50 transition"
                    title="View Zone Details"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Soil Moisture Ring / Bar */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Droplet className="w-3.5 h-3.5 text-blue-500" />
                      Moisture
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      {zone.soil_moisture}%
                    </span>
                  </div>

                  {/* Progress bar with threshold indicator */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.min(100, Math.max(5, zone.soil_moisture))}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-450 mt-1 font-mono">
                    <span>Min: {zone.min_moisture_threshold}%</span>
                    <span>Max: {zone.max_moisture_threshold}%</span>
                  </div>
                </div>

                {/* Microclimate Stats */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-600">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-450 block">Temp</span>
                    <span className="font-semibold text-slate-700">{zone.temperature}°C</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-450 block">Humidity</span>
                    <span className="font-semibold text-slate-700">{zone.humidity}%</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className={`px-2 py-0.5 rounded-md font-semibold border ${statusColor}`}>
                    {isOpen ? 'Irrigating Now' : (isDry ? 'Moisture Deficit' : 'Moisture Optimal')}
                  </span>
                  <div className="flex items-center gap-1 text-slate-450" title="ESP32 Battery">
                    <BatteryMedium className="w-3.5 h-3.5 text-slate-500" />
                    <span>{zone.battery_level}%</span>
                  </div>
                </div>

                {/* Manual Valve Toggle */}
                <button
                  onClick={() => onToggleValve(zone)}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isOpen
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 animate-pulse'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isOpen ? 'Stop Irrigation' : 'Water 10 Min'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

