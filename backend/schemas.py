import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

# --- Zone Schemas ---
class GardenZoneBase(BaseModel):
    name: str
    plant_type: str
    soil_type: str
    area_sqm: float = 100.0
    min_moisture_threshold: float = 40.0
    max_moisture_threshold: float = 75.0
    is_active: bool = True

class GardenZoneCreate(GardenZoneBase):
    pass

class GardenZoneUpdate(BaseModel):
    name: Optional[str] = None
    plant_type: Optional[str] = None
    soil_type: Optional[str] = None
    area_sqm: Optional[float] = None
    min_moisture_threshold: Optional[float] = None
    max_moisture_threshold: Optional[float] = None
    is_active: Optional[bool] = None

class GardenZoneResponse(GardenZoneBase):
    id: int
    soil_moisture: float
    temperature: float
    humidity: float
    light_intensity: float
    battery_level: float
    valve_state: str
    valve_opened_at: Optional[datetime.datetime] = None
    valve_target_duration: int = 0
    last_watered_at: Optional[datetime.datetime] = None
    next_water_scheduled: Optional[datetime.datetime] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        orm_mode = True

# --- Manual Control Request ---
class ManualWaterRequest(BaseModel):
    duration_minutes: int = Field(default=10, ge=1, le=120)

# --- Sensor Ingestion Schema ---
class SensorIngestData(BaseModel):
    zone_id: int
    moisture: float
    temperature: float
    humidity: float
    light_intensity: Optional[float] = 0.0
    battery_level: Optional[float] = 100.0

class SensorReadingResponse(BaseModel):
    id: int
    zone_id: int
    moisture: float
    temperature: float
    humidity: float
    light_intensity: float
    timestamp: datetime.datetime

    class Config:
        orm_mode = True

# --- Irrigation Log Schema ---
class IrrigationLogResponse(BaseModel):
    id: int
    zone_id: int
    zone_name: str
    start_time: datetime.datetime
    end_time: Optional[datetime.datetime] = None
    duration_minutes: int
    water_volume_liters: float
    water_saved_liters: float
    trigger_type: str
    reason: Optional[str] = None
    status: str

    class Config:
        orm_mode = True

# --- Irrigation Schedule Schema ---
class IrrigationScheduleResponse(BaseModel):
    id: int
    zone_id: int
    zone_name: str
    scheduled_time: datetime.datetime
    duration_minutes: int
    estimated_water_liters: float
    priority: str
    status: str
    skip_reason: Optional[str] = None
    ai_confidence: float
    rain_prob_predicted: float
    created_at: datetime.datetime

    class Config:
        orm_mode = True

# --- AI Recommendation Schema ---
class AIRecommendationResponse(BaseModel):
    id: int
    zone_id: Optional[int] = None
    title: str
    message: str
    urgency: str
    category: str
    is_resolved: bool
    created_at: datetime.datetime

    class Config:
        orm_mode = True

# --- Weather Data Schema ---
class CurrentWeather(BaseModel):
    temperature: float
    humidity: float
    condition: str
    rain_probability: float
    wind_speed_kmh: float
    uv_index: float
    evapotranspiration_mm: float
    solar_radiation_wm2: float

class DailyForecast(BaseModel):
    date: str
    temp_max: float
    temp_min: float
    condition: str
    rain_probability: float
    precipitation_mm: float
    evapotranspiration_mm: float

# --- AI Chat Schema ---
class AIChatRequest(BaseModel):
    message: str

class AIChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = []
    recommended_action: Optional[str] = None
    confidence: float = 0.95

# --- Dashboard Summary Schema ---
class DashboardStats(BaseModel):
    total_zones: int
    active_irrigation_zones: int
    avg_soil_moisture: float
    current_temperature: float
    current_humidity: float
    daily_water_consumed_liters: float
    water_saved_liters: float
    next_scheduled_irrigation: Optional[str] = None
    ai_garden_health_summary: str
    active_alerts_count: int

