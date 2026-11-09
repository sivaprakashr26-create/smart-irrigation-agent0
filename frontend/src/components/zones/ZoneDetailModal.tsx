import React from 'react';
import { 
  X, 
  Sprout, 
  Droplet, 
  Thermometer, 
  Wind, 
  Sun, 
  Battery, 
  Clock, 
  Calendar, 
  Layers, 
  Activity, 
  Power
} from 'lucide-react';
import { GardenZone } from '../../types';

interface ZoneDetailModalProps {
  zone: GardenZone | null;
  onClose: () => void;
  onToggleValve: (zone: GardenZone) => void;
}

export const ZoneDetailModal: React.FC<ZoneDetailModalProps> = ({
  zone,
  onClose,
  onToggleValve,
}) => {
  if (!zone) return null;

  const isOpen = zone.valve_state === 'OPEN';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-xl">{zone.name}</h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isOpen ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {isOpen ? 'Valve Open' : 'Valve Closed'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{zone.plant_type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-450 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-between">
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-emerald-600" />
                Soil Moisture
              </span>
              <div className="my-2">
                <span className="text-3xl font-extrabold text-emerald-900">{zone.soil_moisture}%</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                Target: {zone.min_moisture_threshold}% - {zone.max_moisture_threshold}%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex flex-col justify-between">
              <span className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-amber-600" />
                Root Temperature
              </span>
              <div className="my-2">
                <span className="text-3xl font-extrabold text-amber-900">{zone.temperature}°C</span>
              </div>
              <div className="text-[11px] text-amber-700 font-medium">
                Ambient Humidity: {zone.humidity}%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col justify-between">
              <span className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                Irrigation Status
              </span>
              <div className="my-2">
                <span className="text-xl font-bold text-blue-900">
                  {isOpen ? 'Watering' : 'Standby'}
                </span>
              </div>
              <div className="text-[11px] text-blue-700 font-medium">
                Flow: {isOpen ? '15 L/min' : '0 L/min'}
              </div>
            </div>
          </div>

          {/* Agronomic Specifications */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-750 uppercase tracking-wider mb-3">
              Agronomic Soil & Plant Matrix
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-450 block">Soil Type</span>
                <span className="font-semibold text-slate-800">{zone.soil_type}</span>
              </div>
              <div>
                <span className="text-slate-450 block">Surface Area</span>
                <span className="font-semibold text-slate-800">{zone.area_sqm} m²</span>
              </div>
              <div>
                <span className="text-slate-450 block">Crop Factor (Kc)</span>
                <span className="font-semibold text-slate-800">0.95</span>
              </div>
              <div>
                <span className="text-slate-450 block">Node Battery</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-600" />
                  {zone.battery_level}%
                </span>
              </div>
            </div>
          </div>

          {/* Schedule & History info */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-450" />
              <div>
                <span className="text-slate-450 text-[11px] block">Last Watered</span>
                <span className="font-semibold text-slate-800">
                  {zone.last_watered_at ? new Date(zone.last_watered_at).toLocaleString() : 'Recent'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-slate-450 text-[11px] block">Next AI Irrigation</span>
                <span className="font-semibold text-slate-800">
                  {zone.next_water_scheduled ? new Date(zone.next_water_scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today at 06:30 PM'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={() => onToggleValve(zone)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
              isOpen
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOpen ? 'Shut Off Valve' : 'Start 10 Min Water Test'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

