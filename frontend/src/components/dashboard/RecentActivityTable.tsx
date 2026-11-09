import React from 'react';
import { IrrigationLog } from '../../types';
import { Droplet, Clock, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

interface RecentActivityTableProps {
  logs: IrrigationLog[];
}

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({ logs }) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Recent Irrigation Activity</h3>
          <p className="text-xs text-slate-500">Automated AI pulses, manual overrides, and water savings history</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-450 uppercase font-semibold text-[10px] tracking-wider">
              <th className="pb-3 pl-1">Zone</th>
              <th className="pb-3">Trigger Type</th>
              <th className="pb-3">Duration</th>
              <th className="pb-3">Volume Delivered</th>
              <th className="pb-3">Water Conserved</th>
              <th className="pb-3">Decision Reason</th>
              <th className="pb-3 text-right pr-1">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.slice(0, 6).map((log) => {
              const isAI = log.trigger_type.includes('AI') || log.trigger_type.includes('AUTO');
              const isEmergency = log.trigger_type.includes('EMERGENCY');

              return (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 pl-1 font-bold text-slate-800">
                    {log.zone_name}
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                      isEmergency
                        ? 'bg-rose-100 text-rose-800'
                        : isAI 
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {log.trigger_type}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600 font-medium">
                    {log.duration_minutes} mins
                  </td>
                  <td className="py-3 font-semibold text-slate-800">
                    {log.water_volume_liters} L
                  </td>
                  <td className="py-3 font-bold text-emerald-600">
                    +{log.water_saved_liters} L
                  </td>
                  <td className="py-3 text-slate-500 max-w-xs truncate" title={log.reason || ''}>
                    {log.reason || 'Normal threshold hydration cycle'}
                  </td>
                  <td className="py-3 text-right pr-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

