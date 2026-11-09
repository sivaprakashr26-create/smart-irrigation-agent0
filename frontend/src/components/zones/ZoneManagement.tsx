import React, { useState } from 'react';
import { 
  Sprout, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Edit3, 
  Eye, 
  Droplet, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { GardenZone } from '../../types';
import { AddEditZoneModal } from './AddEditZoneModal';
import { ZoneDetailModal } from './ZoneDetailModal';

interface ZoneManagementProps {
  zones: GardenZone[];
  onAddZone: (data: Partial<GardenZone>) => Promise<void>;
  onEditZone: (id: number, data: Partial<GardenZone>) => Promise<void>;
  onDeleteZone: (id: number) => Promise<void>;
  onToggleValve: (zone: GardenZone) => void;
}

export const ZoneManagement: React.FC<ZoneManagementProps> = ({
  zones,
  onAddZone,
  onEditZone,
  onDeleteZone,
  onToggleValve,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<GardenZone | null>(null);
  const [inspectingZone, setInspectingZone] = useState<GardenZone | null>(null);

  const filteredZones = zones.filter((z) =>
    z.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    z.plant_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    z.soil_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalArea = zones.reduce((acc, curr) => acc + curr.area_sqm, 0);
  const deficitZonesCount = zones.filter((z) => z.soil_moisture < z.min_moisture_threshold).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Zones</span>
            <span className="text-2xl font-bold text-slate-800">{zones.length} Campus Zones</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Irrigated Area</span>
            <span className="text-2xl font-bold text-slate-800">{totalArea.toLocaleString()} m²</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            deficitZonesCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {deficitZonesCount > 0 ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Moisture State</span>
            <span className="text-2xl font-bold text-slate-800">
              {deficitZonesCount > 0 ? `${deficitZonesCount} Need Water` : 'All Healthy'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-450 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by zone, plant or soil..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <button
          onClick={() => {
            setEditingZone(null);
            setIsAddModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm shadow-emerald-600/30 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Garden Zone</span>
        </button>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredZones.map((zone) => {
          const isDry = zone.soil_moisture < zone.min_moisture_threshold;
          const isOpen = zone.valve_state === 'OPEN';

          return (
            <div
              key={zone.id}
              className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                isOpen ? 'border-blue-400 ring-2 ring-blue-500/10' : 'border-slate-200'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">
                      {zone.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{zone.plant_type}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    isOpen 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                      : isDry 
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {isOpen ? 'Irrigating' : (isDry ? 'Thirsty' : 'Optimal')}
                  </span>
                </div>

                {/* Main Gauge */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 my-4">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                      <Droplet className="w-4 h-4 text-blue-500" />
                      Current Moisture Level
                    </span>
                    <span className="font-extrabold text-slate-900 text-base">{zone.soil_moisture}%</span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDry ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, zone.soil_moisture))}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-450 mt-2 font-mono">
                    <span>Min Trigger: {zone.min_moisture_threshold}%</span>
                    <span>Field Capacity: {zone.max_moisture_threshold}%</span>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-450 block uppercase font-bold">Soil Medium</span>
                    <span className="font-semibold text-slate-800 truncate block">{zone.soil_type}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-450 block uppercase font-bold">Surface Area</span>
                    <span className="font-semibold text-slate-800">{zone.area_sqm} m²</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-450 block uppercase font-bold">Temperature</span>
                    <span className="font-semibold text-slate-800">{zone.temperature}°C</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-450 block uppercase font-bold">Humidity</span>
                    <span className="font-semibold text-slate-800">{zone.humidity}%</span>
                  </div>
                </div>

                {/* Last / Next Schedule */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Last: {zone.last_watered_at ? new Date(zone.last_watered_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent'}
                  </span>
                  <span className="font-medium text-emerald-700">
                    Next: {zone.next_water_scheduled ? new Date(zone.next_water_scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:00 PM'}
                  </span>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setInspectingZone(zone)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Inspect Details"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingZone(zone);
                      setIsAddModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition"
                    title="Configure Thresholds"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteZone(zone.id)}
                    className="p-2 rounded-xl text-slate-450 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Zone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <AddEditZoneModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={async (data) => {
          if (editingZone) {
            await onEditZone(editingZone.id, data);
          } else {
            await onAddZone(data);
          }
        }}
        zoneToEdit={editingZone}
      />

      {/* Inspect Zone Modal */}
      <ZoneDetailModal
        zone={inspectingZone}
        onClose={() => setInspectingZone(null)}
        onToggleValve={onToggleValve}
      />
    </div>
  );
};

