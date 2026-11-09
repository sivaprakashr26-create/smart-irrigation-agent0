import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { ThermometerSun } from 'lucide-react';

export const TempHumidityChart: React.FC = () => {
  const data = [
    { time: '02:00', temp: 22.0, humidity: 82, vpd: 0.45 },
    { time: '05:00', temp: 21.2, humidity: 86, vpd: 0.35 },
    { time: '08:00', temp: 24.5, humidity: 72, vpd: 0.85 },
    { time: '11:00', temp: 28.8, humidity: 55, vpd: 1.78 },
    { time: '14:00', temp: 31.4, humidity: 46, vpd: 2.45 }, // Peak heat & evaporation
    { time: '17:00', temp: 29.2, humidity: 52, vpd: 1.95 },
    { time: '20:00', temp: 25.8, humidity: 66, vpd: 1.10 },
    { time: '23:00', temp: 23.5, humidity: 76, vpd: 0.68 },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <ThermometerSun className="w-4 h-4 text-amber-500" />
            Microclimate: Temperature & Humidity
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Diurnal curve used to calculate Vapor Pressure Deficit (VPD) and evaporation
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis yAxisId="left" stroke="#f59e0b" fontSize={11} tickLine={false} domain={[15, 40]} unit="°C" />
            <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={11} tickLine={false} domain={[30, 100]} unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

            <Area yAxisId="right" type="monotone" dataKey="humidity" name="Relative Humidity (%)" fill="#dbeafe" stroke="#3b82f6" strokeWidth={1.5} />
            <Line yAxisId="left" type="monotone" dataKey="temp" name="Ambient Temperature (°C)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

