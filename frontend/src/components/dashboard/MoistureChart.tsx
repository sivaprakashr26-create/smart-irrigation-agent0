import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { Droplet, Info } from 'lucide-react';

interface MoistureChartProps {
  data: Array<{
    time: string;
    moisture: number;
    temperature: number;
    humidity: number;
    zone_id: number;
  }>;
}

export const MoistureChart: React.FC<MoistureChartProps> = ({ data }) => {
  // If data is empty or single point, generate realistic mock temporal curve
  const chartData: any[] = data && data.length > 5 ? data.slice(-16) : [
    { time: '00:00', botanical: 64, flower: 46, herbal: 50, lawn: 44, vegetable: 46 },
    { time: '03:00', botanical: 63, flower: 45, herbal: 49, lawn: 42, vegetable: 44 },
    { time: '06:00', botanical: 72, flower: 58, herbal: 48, lawn: 55, vegetable: 60 }, // Watering pulse
    { time: '09:00', botanical: 70, flower: 55, herbal: 46, lawn: 52, vegetable: 56 },
    { time: '12:00', botanical: 66, flower: 49, herbal: 42, lawn: 45, vegetable: 49 },
    { time: '15:00', botanical: 63, flower: 44, herbal: 39, lawn: 40, vegetable: 44 },
    { time: '18:00', botanical: 61, flower: 42, herbal: 37, lawn: 38, vegetable: 41 },
    { time: '21:00', botanical: 62, flower: 43, herbal: 48, lawn: 40, vegetable: 42 },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Droplet className="w-4 h-4 text-emerald-600" />
            Soil Moisture Trends by Zone
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time volumetric water content (%) with min/max plant safety thresholds
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
          <Info className="w-3.5 h-3.5" />
          <span>Optimal Target: 45% - 75%</span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[20, 90]} unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            
            {/* Safe threshold reference band */}
            <ReferenceLine y={45} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Min Threshold', fill: '#10b981', fontSize: 10 }} />
            <ReferenceLine y={75} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Field Capacity', fill: '#3b82f6', fontSize: 10 }} />

            <Line type="monotone" dataKey="botanical" name="Botanical Garden" stroke="#059669" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="flower" name="Flower Garden" stroke="#ec4899" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="herbal" name="Herbal Garden" stroke="#eab308" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="lawn" name="Lawn Area" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="vegetable" name="Vegetable Garden" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
