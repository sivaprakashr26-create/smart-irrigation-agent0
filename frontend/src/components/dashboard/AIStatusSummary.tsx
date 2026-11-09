import React from 'react';
import { Sparkles, Brain, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

interface AIStatusSummaryProps {
  summary: string;
  onRunOptimizer: () => void;
  isOptimizing: boolean;
}

export const AIStatusSummary: React.FC<AIStatusSummaryProps> = ({
  summary,
  onRunOptimizer,
  isOptimizing,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-md relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Brain className="w-3.5 h-3.5 text-emerald-400" />
              AI Agronomic Intelligence Engine
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-200/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              FAO-56 Evapotranspiration Active
            </span>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Campus Garden Health & Irrigation State
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed">
            {summary}
          </p>
        </div>

        <button
          onClick={onRunOptimizer}
          disabled={isOptimizing}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
          <span>{isOptimizing ? 'Evaluating Microclimates...' : 'Recalculate AI Schedule'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

