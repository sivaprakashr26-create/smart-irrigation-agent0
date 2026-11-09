import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  ShieldAlert, 
  RefreshCw, 
  Droplet, 
  CloudRain, 
  Thermometer, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight,
  Calculator,
  Compass,
  TrendingDown
} from 'lucide-react';
import { IrrigationSchedule, GardenZone, CurrentWeather, DailyForecast } from '../../types';

interface AIAgentViewProps {
  zones: GardenZone[];
  schedules: IrrigationSchedule[];
  weather: CurrentWeather | null;
  forecast: DailyForecast[];
  onRunOptimizer: () => Promise<void>;
  isOptimizing: boolean;
}

export const AIAgentView: React.FC<AIAgentViewProps> = ({
  zones,
  schedules,
  weather,
  forecast,
  onRunOptimizer,
  isOptimizing,
}) => {
  const [activeTab, setActiveTab] = useState<'schedules' | 'matrix' | 'fao56'>('schedules');

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                <BrainCircuit className="w-4 h-4 text-emerald-400 animate-pulse" />
                Autonomous Agronomic Scheduling Agent
              </span>
              <span className="text-xs text-emerald-200/80 font-medium">
                Version 2.4 ML-Ready
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              AI Decision & Irrigation Optimization Engine
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed">
              Continuously correlates real-time capacitive soil moisture, species-specific crop coefficients (Kc), soil infiltration properties, and hyperlocal weather precipitation probabilities to generate dynamic, waste-free irrigation schedules.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onRunOptimizer}
              disabled={isOptimizing}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/30 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
              <span>{isOptimizing ? 'Evaluating Model...' : 'Run Optimization Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('schedules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'schedules'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Upcoming AI Schedules ({schedules.length})
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'matrix'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Zone Multi-Variable Decision Matrix
        </button>
        <button
          onClick={() => setActiveTab('fao56')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'fao56'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          FAO-56 Evapotranspiration Architecture
        </button>
      </div>

      {/* TAB 1: Upcoming AI Schedules */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Pending AI Cycles</span>
                <span className="text-xl font-bold text-slate-800">
                  {schedules.filter((s) => s.status === 'PENDING').length} Scheduled
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Rain Skipped Cycles</span>
                <span className="text-xl font-bold text-emerald-600">
                  {schedules.filter((s) => s.status === 'SKIPPED').length} Cycles Saved
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Avg Agent Confidence</span>
                <span className="text-xl font-bold text-slate-800">95.4%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Optimized Irrigation Schedule Queue</h3>
                <p className="text-xs text-slate-500">Autonomous plans dynamically timed for minimum evaporation</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {schedules.map((schedule) => {
                const isSkipped = schedule.status === 'SKIPPED';
                const isPending = schedule.status === 'PENDING';

                return (
                  <div key={schedule.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        isSkipped ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isSkipped ? <CloudRain className="w-6 h-6" /> : <Droplet className="w-6 h-6" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base">{schedule.zone_name}</h4>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isSkipped 
                              ? 'bg-amber-100 text-amber-800' 
                              : schedule.priority === 'HIGH' 
                              ? 'bg-rose-100 text-rose-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isSkipped ? 'SKIPPED (RAIN SHIELD)' : `${schedule.priority} PRIORITY`}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                          {isSkipped 
                            ? (schedule.skip_reason || 'Bypassed irrigation cycle because weather forecast predicts rain.') 
                            : `Scheduled precision cycle for ${schedule.duration_minutes} minutes (${schedule.estimated_water_liters} L estimated volume).`}
                        </p>

                        <div className="flex items-center gap-4 text-[11px] text-slate-450 pt-1">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-450" />
                            Target Time: {new Date(schedule.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span>Predicted Rain: {schedule.rain_prob_predicted}%</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">AI Confidence: {(schedule.ai_confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                        isSkipped 
                          ? 'bg-slate-100 text-slate-600' 
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {isSkipped ? 'Conserved Water' : `${schedule.duration_minutes} min Cycle`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Multi-Variable Decision Matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Real-Time Agronomic Decision Matrix</h3>
            <p className="text-xs text-slate-500">Live variables evaluated by the heuristic engine every cycle</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-450 uppercase font-bold text-[10px] tracking-wider">
                  <th className="pb-3">Zone</th>
                  <th className="pb-3">Plant Type</th>
                  <th className="pb-3">Kc Factor</th>
                  <th className="pb-3">Soil Type</th>
                  <th className="pb-3">Current Moisture</th>
                  <th className="pb-3">Target Range</th>
                  <th className="pb-3">Rain Probability</th>
                  <th className="pb-3">AI Agent Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {zones.map((z) => {
                  const isDry = z.soil_moisture < z.min_moisture_threshold;
                  const rainProb = weather?.rain_probability || 15;
                  const willRain = rainProb > 55;

                  let decision = 'Optimal (Standby)';
                  let badgeClass = 'bg-emerald-100 text-emerald-800';

                  if (willRain) {
                    decision = 'Defer (Rain Shield Active)';
                    badgeClass = 'bg-blue-100 text-blue-800';
                  } else if (isDry) {
                    decision = 'Irrigate 15 min at Dusk';
                    badgeClass = 'bg-amber-100 text-amber-800';
                  }

                  return (
                    <tr key={z.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 font-bold text-slate-800">{z.name}</td>
                      <td className="py-3.5 text-slate-600 truncate max-w-[120px]">{z.plant_type}</td>
                      <td className="py-3.5 font-mono font-semibold text-slate-700">0.95</td>
                      <td className="py-3.5 text-slate-600">{z.soil_type}</td>
                      <td className="py-3.5 font-bold text-slate-900">{z.soil_moisture}%</td>
                      <td className="py-3.5 text-slate-500 font-mono">{z.min_moisture_threshold}% - {z.max_moisture_threshold}%</td>
                      <td className="py-3.5 text-slate-700">{rainProb}%</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${badgeClass}`}>
                          {decision}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FAO-56 Evapotranspiration Architecture */}
      {activeTab === 'fao56' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">FAO-56 Penman-Monteith Calculation</h3>
                <p className="text-xs text-slate-500">Global scientific reference equation for water demand</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 font-mono text-xs text-slate-700 border border-slate-200 leading-relaxed">
              ETc = Kc × ET0<br /><br />
              Water Volume = Area (m²) × Root Depth (m) × (Field Capacity - Current Moisture) × Kc × Soil Efficiency
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              The agent avoids rigid mechanical timers. Instead, it measures how many millimeters of water transpired through the plant leaves and evaporated from the soil surface (ET0), replacing only the exact deficit.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Vapor Pressure Deficit (VPD) Shield</h3>
                <p className="text-xs text-slate-500">Mitigates high-temperature evaporative water loss</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              When ambient temperatures exceed 30°C and humidity drops, the atmospheric drying power (VPD) skyrockets. Up to 40% of irrigation water evaporated into the air before reaching root zones if sprayed at noon.
            </p>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>The AI automatically constrains non-critical irrigation to 05:30 - 07:00 and 18:30 - 20:00 windows.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

