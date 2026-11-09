import React, { useState } from 'react';
import { 
  Pipette, 
  Power, 
  AlertOctagon, 
  Clock, 
  Droplets, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Play 
} from 'lucide-react';
import { GardenZone } from '../../types';

interface ManualControlsProps {
  zones: GardenZone[];
  onOpenValve: (zoneId: number, durationMinutes: number) => Promise<void>;
  onCloseValve: (zoneId: number) => Promise<void>;
  onEmergencyStop: () => Promise<void>;
}

export const ManualControls: React.FC<ManualControlsProps> = ({
  zones,
  onOpenValve,
  onCloseValve,
  onEmergencyStop,
}) => {
  const [selectedDurations, setSelectedDurations] = useState<{ [zoneId: number]: number }>({
    1: 10,
    2: 10,
    3: 10,
    4: 15,
    5: 10,
  });
  const [loadingZoneId, setLoadingZoneId] = useState<number | null>(null);

  const setDuration = (zoneId: number, mins: number) => {
    setSelectedDurations((prev) => ({ ...prev, [zoneId]: mins }));
  };

  const handleToggle = async (zone: GardenZone) => {
    setLoadingZoneId(zone.id);
    try {
      if (zone.valve_state === 'OPEN') {
        await onCloseValve(zone.id);
      } else {
        const dur = selectedDurations[zone.id] || 10;
        await onOpenValve(zone.id, dur);
      }
    } finally {
      setLoadingZoneId(null);
    }
  };

  const activeCount = zones.filter((z) => z.valve_state === 'OPEN').length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Master Emergency Stop */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-800 text-lg">Direct Solenoid Valve Overrides</h3>
          </div>
          <p className="text-xs text-slate-500">
            Manual control is equipped with automated watchdog shutoff timers to protect campus lawns from over-saturation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <span className="text-[11px] text-slate-450 block uppercase font-bold">Active Valves</span>
            <span className="text-lg font-extrabold text-blue-600">{activeCount} of {zones.length}</span>
          </div>

          <button
            onClick={onEmergencyStop}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition shadow-md shadow-rose-600/30 active:scale-95 cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Master Emergency Shutoff</span>
          </button>
        </div>
      </div>

      {/* Zone Control Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone) => {
          const isOpen = zone.valve_state === 'OPEN';
          const dur = selectedDurations[zone.id] || 10;
          const isLoading = loadingZoneId === zone.id;

          return (
            <div
              key={zone.id}
              className={`p-6 rounded-3xl bg-white border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between ${
                isOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{zone.name}</h4>
                    <p className="text-xs text-slate-500">{zone.plant_type}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                    isOpen
                      ? 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {isOpen ? 'VALVE OPEN' : 'VALVE CLOSED'}
                  </span>
                </div>

                {/* Moisture snapshot */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 my-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-slate-600">Current Soil Moisture</span>
                  </div>
                  <span className="text-base font-extrabold text-slate-800">{zone.soil_moisture}%</span>
                </div>

                {/* Duration Selector */}
                {!isOpen && (
                  <div className="space-y-2 mb-4">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Auto-Off Duration Timer
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[5, 10, 15, 30].map((m) => (
                        <button
                          key={m}
                          onClick={() => setDuration(zone.id, m)}
                          className={`py-1.5 rounded-xl font-bold text-xs transition ${
                            dur === m
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Info */}
                {isOpen && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-1 mb-4">
                    <div className="flex justify-between font-semibold">
                      <span>Flow Rate:</span>
                      <span>15.0 L / minute</span>
                    </div>
                    <div className="flex justify-between text-blue-700">
                      <span>Safety Auto-Off:</span>
                      <span>Active</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggle Button */}
              <button
                onClick={() => handleToggle(zone)}
                disabled={isLoading}
                className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50 ${
                  isOpen
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>
                  {isLoading 
                    ? 'Transmitting Signal...' 
                    : isOpen 
                    ? 'Close Solenoid Valve' 
                    : `Open Valve (${dur} min cycle)`}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

