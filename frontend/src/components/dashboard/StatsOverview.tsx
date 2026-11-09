import React from 'react';
import { 
  Sprout, 
  Droplet, 
  Gauge, 
  ThermometerSun, 
  BadgePercent, 
  CalendarClock, 
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { DashboardStats } from '../../types';

interface StatsOverviewProps {
  stats: DashboardStats;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Campus Garden Zones',
      value: stats.total_zones,
      subvalue: '5 Monitored Microclimates',
      icon: Sprout,
      color: 'emerald',
      bgGradient: 'from-emerald-500/10 to-teal-500/5',
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Active Irrigation',
      value: stats.active_irrigation_zones,
      subvalue: stats.active_irrigation_zones > 0 ? 'Solenoid Valves Open' : 'All Valves Closed',
      icon: Droplet,
      color: stats.active_irrigation_zones > 0 ? 'blue' : 'slate',
      bgGradient: stats.active_irrigation_zones > 0 ? 'from-blue-500/10 to-cyan-500/5' : 'from-slate-100 to-slate-50',
      iconBg: stats.active_irrigation_zones > 0 ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-slate-100 text-slate-500',
    },
    {
      label: 'Average Soil Moisture',
      value: `${stats.avg_soil_moisture}%`,
      subvalue: stats.avg_soil_moisture >= 45 ? 'Optimal Root Zone Level' : 'Moderate Moisture Deficit',
      icon: Gauge,
      color: 'teal',
      bgGradient: 'from-teal-500/10 to-emerald-500/5',
      iconBg: 'bg-teal-100 text-teal-700',
    },
    {
      label: 'Ambient Microclimate',
      value: `${stats.current_temperature}°C`,
      subvalue: `${stats.current_humidity}% Relative Humidity`,
      icon: ThermometerSun,
      color: 'amber',
      bgGradient: 'from-amber-500/10 to-orange-500/5',
      iconBg: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Daily Water Consumed',
      value: `${stats.daily_water_consumed_liters.toLocaleString()} L`,
      subvalue: 'Precision Emitter Volume',
      icon: TrendingUp,
      color: 'indigo',
      bgGradient: 'from-indigo-500/10 to-blue-500/5',
      iconBg: 'bg-indigo-100 text-indigo-700',
    },
    {
      label: 'Water Saved (AI Driven)',
      value: `${stats.water_saved_liters.toLocaleString()} L`,
      subvalue: 'Conserved via Rain & ET',
      icon: BadgePercent,
      color: 'green',
      bgGradient: 'from-green-500/10 to-emerald-500/5',
      iconBg: 'bg-green-100 text-green-700',
      badge: '38% Savings',
    },
    {
      label: 'Next Scheduled Irrigation',
      value: stats.next_scheduled_irrigation || 'Standby',
      subvalue: 'Predictive FAO-56 Engine',
      icon: CalendarClock,
      color: 'purple',
      bgGradient: 'from-purple-500/10 to-indigo-500/5',
      iconBg: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden group`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1">
                  {card.label}
                </p>
                <h3 className="text-2xl font-bold text-slate-850 tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div className={`p-2.5 rounded-xl ${card.iconBg} transition-transform group-hover:scale-105`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">{card.subvalue}</span>
              {card.badge && (
                <span className="font-bold text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  {card.badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

