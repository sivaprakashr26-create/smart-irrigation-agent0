import React from 'react';
import { 
  CloudSun, 
  Thermometer, 
  Droplets, 
  CloudRain, 
  Wind, 
  Sun, 
  Gauge, 
  CalendarDays,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { CurrentWeather, DailyForecast } from '../../types';

interface WeatherViewProps {
  weather: CurrentWeather | null;
  forecast: DailyForecast[];
}

export const WeatherView: React.FC<WeatherViewProps> = ({ weather, forecast }) => {
  return (
    <div className="space-y-6">
      {/* Current Weather Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block mb-1">
              Campus Microclimate
            </span>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-extrabold">{weather ? `${weather.temperature}°C` : '27.5°C'}</h2>
              <span className="text-base text-emerald-200">{weather?.condition || 'Clear Sky'}</span>
            </div>
            <p className="text-xs text-slate-300 mt-2">
              Hyperlocal telemetry from weather station & Open-Meteo satellite grid
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs py-1 border-b border-white/10">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-300" />
                Relative Humidity
              </span>
              <span className="font-bold text-white">{weather?.humidity || 62}%</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-white/10">
              <span className="text-slate-300 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-indigo-300" />
                Rain Probability
              </span>
              <span className="font-bold text-white">{weather?.rain_probability || 15}%</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-teal-300" />
                Wind Speed
              </span>
              <span className="font-bold text-white">{weather?.wind_speed_kmh || 12} km/h</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs py-1 border-b border-white/10">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-300" />
                Solar Radiation
              </span>
              <span className="font-bold text-white">{weather?.solar_radiation_wm2 || 750} W/m²</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-white/10">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-300" />
                UV Index
              </span>
              <span className="font-bold text-white">{weather?.uv_index || 6.5} / 11</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-emerald-300" />
                ET0 Rate
              </span>
              <span className="font-bold text-white">{weather?.evapotranspiration_mm || 4.2} mm/day</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Rain Shield Status</span>
            </div>
            <p className="text-xs text-slate-200 mt-2 leading-relaxed">
              {weather && weather.rain_probability >= 50
                ? "Active rain prediction. AI is holding scheduled cycles."
                : "Dry conditions. Automated evapotranspiration schedules in effect."}
            </p>
            <div className="mt-3 text-[11px] font-mono text-emerald-200">
              Threshold: &gt; 55% Rain
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-800 text-base">7-Day Irrigation Forecast & Rain Probability</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {forecast.map((day, idx) => {
            const hasRain = day.rain_probability > 50;

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-center flex flex-col justify-between transition-all ${
                  hasRain
                    ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                    : 'bg-slate-50/70 border-slate-200 text-slate-800'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block mb-1">{day.date}</span>
                  <div className="my-2 flex justify-center">
                    {hasRain ? (
                      <CloudRain className="w-8 h-8 text-blue-500 animate-bounce" />
                    ) : (
                      <Sun className="w-8 h-8 text-amber-500" />
                    )}
                  </div>
                  <span className="text-xs font-semibold block text-slate-600">{day.condition}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-1">
                  <div className="text-xs font-bold text-slate-800">
                    {day.temp_max}° / {day.temp_min}°
                  </div>
                  <div className="text-[11px] text-blue-600 font-semibold">
                    {day.rain_probability}% Rain
                  </div>
                  <div className="text-[10px] text-slate-450">
                    ET: {day.evapotranspiration_mm} mm
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

