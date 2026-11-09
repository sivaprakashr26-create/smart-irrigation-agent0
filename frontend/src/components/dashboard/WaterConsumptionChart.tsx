import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { BadgePercent } from 'lucide-react';

interface WaterConsumptionChartProps {
  data: Array<{
    day: string;
    date: string;
    consumed_liters: number;
    saved_liters: number;
  }>;
}

export const WaterConsumptionChart: React.FC<WaterConsumptionChartProps> = ({ data }) => {
  const chartData = data && data.length > 0 ? data : [
    { day: 'Mon', consumed_liters: 420, saved_liters: 210 },
    { day: 'Tue', consumed_liters: 380, saved_liters: 195 },
    { day: 'Wed', consumed_liters: 510, saved_liters: 260 },
    { day: 'Thu', consumed_liters: 150, saved_liters: 420 }, // Rain shield day
    { day: 'Fri', consumed_liters: 460, saved_liters: 230 },
    { day: 'Sat', consumed_liters: 390, saved_liters: 205 },
    { day: 'Sun', consumed_liters: 480, saved_liters: 240 },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <BadgePercent className="w-4 h-4 text-emerald-600" />
            Daily Water Consumption vs Water Saved
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Liters delivered through drip/sprinklers vs conserved via smart scheduling
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" L" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

            <Bar dataKey="consumed_liters" name="Water Consumed (Liters)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="saved_liters" name="Water Saved (Liters)" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

