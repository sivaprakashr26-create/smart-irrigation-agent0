import React, { useState, useEffect } from 'react';
import { X, Sprout, Save, AlertCircle } from 'lucide-react';
import { GardenZone } from '../../types';

interface AddEditZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (zoneData: Partial<GardenZone>) => Promise<void>;
  zoneToEdit?: GardenZone | null;
}

export const AddEditZoneModal: React.FC<AddEditZoneModalProps> = ({
  isOpen,
  onClose,
  onSave,
  zoneToEdit,
}) => {
  const [name, setName] = useState('');
  const [plantType, setPlantType] = useState('');
  const [soilType, setSoilType] = useState('Loam (Rich Organic)');
  const [areaSqm, setAreaSqm] = useState(150);
  const [minMoisture, setMinMoisture] = useState(45);
  const [maxMoisture, setMaxMoisture] = useState(75);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (zoneToEdit) {
      setName(zoneToEdit.name);
      setPlantType(zoneToEdit.plant_type);
      setSoilType(zoneToEdit.soil_type);
      setAreaSqm(zoneToEdit.area_sqm);
      setMinMoisture(zoneToEdit.min_moisture_threshold);
      setMaxMoisture(zoneToEdit.max_moisture_threshold);
    } else {
      setName('');
      setPlantType('');
      setSoilType('Loam (Rich Organic)');
      setAreaSqm(150);
      setMinMoisture(45);
      setMaxMoisture(75);
    }
    setError('');
  }, [zoneToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !plantType.trim()) {
      setError('Please provide both Zone Name and Plant Type');
      return;
    }
    if (minMoisture >= maxMoisture) {
      setError('Minimum moisture threshold must be lower than maximum threshold');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name,
        plant_type: plantType,
        soil_type: soilType,
        area_sqm: Number(areaSqm),
        min_moisture_threshold: Number(minMoisture),
        max_moisture_threshold: Number(maxMoisture),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save zone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                {zoneToEdit ? 'Edit Garden Zone' : 'Add New Garden Zone'}
              </h3>
              <p className="text-xs text-slate-500">Configure microclimate zone and moisture criteria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-450 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Zone Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Zen Meditation Garden"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Plant / Crop Type
            </label>
            <input
              type="text"
              value={plantType}
              onChange={(e) => setPlantType(e.target.value)}
              placeholder="e.g. Lavender, Rosemary & Hydrangeas"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Soil Type
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
              >
                <option value="Loam (Rich Organic)">Loam (Rich Organic)</option>
                <option value="Sandy Loam">Sandy Loam</option>
                <option value="Clay Loam">Clay Loam</option>
                <option value="Sandy Soil">Sandy Soil</option>
                <option value="Silty Loam">Silty Loam</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Garden Area (m²)
              </label>
              <input
                type="number"
                value={areaSqm}
                onChange={(e) => setAreaSqm(Number(e.target.value))}
                min="10"
                max="5000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Moisture Threshold Sliders */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-slate-700">Minimum Moisture Threshold (%)</span>
                <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                  {minMoisture}%
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="70"
                value={minMoisture}
                onChange={(e) => setMinMoisture(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="text-[10px] text-slate-450 mt-0.5">Irrigation is automatically triggered when moisture falls below this point.</p>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-slate-700">Maximum Moisture Threshold (%)</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                  {maxMoisture}%
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                value={maxMoisture}
                onChange={(e) => setMaxMoisture(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <p className="text-[10px] text-slate-450 mt-0.5">Valves automatically close when soil reaches this field capacity to prevent overwatering.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm shadow-emerald-600/30 disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Zone'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

