export interface GardenZone {
  id: number;
  name: string;
  plant_type: string;
  soil_type: string;
  area_sqm: number;
  soil_moisture: number;
  temperature: number;
  humidity: number;
  light_intensity: number;
  battery_level: number;
  is_active: boolean;
  valve_state: 'OPEN' | 'CLOSED';
  valve_opened_at?: string;
  valve_target_duration: number;
  min_moisture_threshold: number;
  max_moisture_threshold: number;
  last_watered_at?: string;
  next_water_scheduled?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_zones: number;
  active_irrigation_zones: number;
  avg_soil_moisture: number;
  current_temperature: number;
  current_humidity: number;
  daily_water_consumed_liters: number;
  water_saved_liters: number;
  next_scheduled_irrigation?: string;
  ai_garden_health_summary: string;
  active_alerts_count: number;
}

export interface IrrigationLog {
  id: number;
  zone_id: number;
  zone_name: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  water_volume_liters: number;
  water_saved_liters: number;
  trigger_type: string;
  reason?: string;
  status: string;
}

export interface IrrigationSchedule {
  id: number;
  zone_id: number;
  zone_name: string;
  scheduled_time: string;
  duration_minutes: number;
  estimated_water_liters: number;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  skip_reason?: string;
  ai_confidence: number;
  rain_prob_predicted: number;
  created_at: string;
}

export interface AIRecommendation {
  id: number;
  zone_id?: number;
  title: string;
  message: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  is_resolved: boolean;
  created_at: string;
}

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  condition: string;
  rain_probability: number;
  wind_speed_kmh: number;
  uv_index: number;
  evapotranspiration_mm: number;
  solar_radiation_wm2: number;
}

export interface DailyForecast {
  date: string;
  temp_max: number;
  temp_min: number;
  condition: string;
  rain_probability: number;
  precipitation_mm: number;
  evapotranspiration_mm: number;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  suggestions?: string[];
  recommended_action?: string;
  timestamp: string;
}

