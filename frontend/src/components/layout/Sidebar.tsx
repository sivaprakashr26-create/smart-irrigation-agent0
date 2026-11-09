import React from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  BrainCircuit, 
  MessageSquareCode, 
  Pipette, 
  CloudSun, 
  Cpu, 
  BarChart3, 
  ShieldCheck, 
  Leaf
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeValvesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab,
  activeValvesCount 
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'zones', label: 'Garden Zones', icon: Sprout },
    { id: 'agent', label: 'AI Scheduling Agent', icon: BrainCircuit, badge: 'AI' },
    { id: 'assistant', label: 'AI Assistant', icon: MessageSquareCode },
    { 
      id: 'manual', 
      label: 'Manual Control', 
      icon: Pipette, 
      count: activeValvesCount > 0 ? `${activeValvesCount} Active` : undefined 
    },
    { id: 'weather', label: 'Weather Station', icon: CloudSun },
    { id: 'iot', label: 'IoT & Hardware', icon: Cpu },
    { id: 'analytics', label: 'Water Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-xs z-20">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Leaf className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight flex items-center gap-1.5">
              Smart Irrigation
            </h1>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
              Campus Garden Agent
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-450'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.count && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 m-3 rounded-2xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <span className="text-xs font-semibold text-slate-700">IoT Mesh Active</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
          Sensors syncing via ESP32 telemetry & dynamic weather predictive models.
        </p>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Water Wastage Shield: ON</span>
        </div>
      </div>
    </aside>
  );
};

