import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingDown, 
  Droplet, 
  Calendar, 
  Search, 
  Download, 
  CheckCircle2, 
  Filter 
} from 'lucide-react';
import { IrrigationLog } from '../../types';
import { WaterConsumptionChart } from '../dashboard/WaterConsumptionChart';

interface AnalyticsViewProps {
  logs: IrrigationLog[];
  waterUsage: Array<{ day: string; date: string; consumed_liters: number; saved_liters: number }>;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ logs, waterUsage }) => {
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const totalConsumed = waterUsage.reduce((acc, c) => acc + c.consumed_liters, 0);
  const totalSaved = waterUsage.reduce((acc, c) => acc + c.saved_liters, 0);
  const efficiencyRatio = Math.round((totalSaved / (totalConsumed + totalSaved || 1)) * 100);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.zone_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterType === 'ALL') return matchesSearch;
    return matchesSearch && log.trigger_type.includes(filterType);
  });

  const exportCSV = () => {
    const headers = 'ID,Zone,Start Time,Duration(min),Volume(L),Saved(L),Trigger,Status,Reason\n';
    const rows = logs.map((l) => 
      `${l.id},"${l.zone_name}","${l.start_time}",${l.duration_minutes},${l.water_volume_liters},${l.water_saved_liters},"${l.trigger_type}","${l.status}","${(l.reason || '').replace(/"/g, '""')}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_irrigation_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">7-Day Water Consumed</span>
            <span className="text-2xl font-bold text-slate-800">{totalConsumed.toLocaleString()} Liters</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">7-Day Water Conserved</span>
            <span className="text-2xl font-bold text-emerald-600">{totalSaved.toLocaleString()} Liters</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Efficiency Conservation Index</span>
            <span className="text-2xl font-bold text-purple-700">{efficiencyRatio}% Saved</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <WaterConsumptionChart data={waterUsage} />

      {/* History Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Historical Irrigation Activity Log</h3>
            <p className="text-xs text-slate-500">Auditable record of all valve state transitions</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-450 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by zone or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-stretch sm:self-auto">
            {['ALL', 'AI', 'MANUAL'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === t ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'ALL' ? 'All Events' : (t === 'AI' ? 'AI Auto' : 'Manual')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-450 uppercase font-bold text-[10px] tracking-wider">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Zone</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3">Volume</th>
                <th className="pb-3">Water Conserved</th>
                <th className="pb-3">Trigger Type</th>
                <th className="pb-3">Reason</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 text-slate-500 font-mono text-[11px]">
                    {new Date(log.start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 font-bold text-slate-800">{log.zone_name}</td>
                  <td className="py-3 text-slate-600">{log.duration_minutes} min</td>
                  <td className="py-3 font-semibold text-slate-800">{log.water_volume_liters} L</td>
                  <td className="py-3 font-bold text-emerald-600">+{log.water_saved_liters} L</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      log.trigger_type.includes('AI') ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {log.trigger_type}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500 max-w-xs truncate" title={log.reason || ''}>
                    {log.reason || 'Normal threshold hydration'}
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

