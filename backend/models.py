import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class GardenZone(Base):
    __tablename__ = "garden_zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    plant_type = Column(String(100), nullable=False)
    soil_type = Column(String(100), nullable=False)
    area_sqm = Column(Float, default=100.0)
    
    # Real-time state
    soil_moisture = Column(Float, default=50.0)  # Percentage %
    temperature = Column(Float, default=24.0)    # Celsius
    humidity = Column(Float, default=60.0)       # Percentage %
    light_intensity = Column(Float, default=850.0) # Lux
    battery_level = Column(Float, default=95.0)  # Sensor node battery %
    
    # Valve & Irrigation state
    is_active = Column(Boolean, default=True)
    valve_state = Column(String(20), default="CLOSED") # CLOSED or OPEN
    valve_opened_at = Column(DateTime, nullable=True)
    valve_target_duration = Column(Integer, default=0) # in minutes
    
    # Thresholds
    min_moisture_threshold = Column(Float, default=40.0) # Irrigation triggered below this
    max_moisture_threshold = Column(Float, default=75.0) # Irrigation stopped above this
    
    # History & Planning
    last_watered_at = Column(DateTime, nullable=True)
    next_water_scheduled = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    sensor_readings = relationship("SensorReading", back_populates="zone", cascade="all, delete-orphan")
    irrigation_logs = relationship("IrrigationLog", back_populates="zone", cascade="all, delete-orphan")
    schedules = relationship("IrrigationSchedule", back_populates="zone", cascade="all, delete-orphan")
    recommendations = relationship("AIRecommendation", back_populates="zone", cascade="all, delete-orphan")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("garden_zones.id"), nullable=False)
    moisture = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    light_intensity = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    zone = relationship("GardenZone", back_populates="sensor_readings")


class IrrigationLog(Base):
    __tablename__ = "irrigation_logs"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("garden_zones.id"), nullable=False)
    zone_name = Column(String(100), nullable=False)
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, default=0)
    water_volume_liters = Column(Float, default=0.0)
    water_saved_liters = Column(Float, default=0.0)
    trigger_type = Column(String(50), default="AI_AUTOMATIC") # AI_AUTOMATIC, MANUAL, SCHEDULED
    reason = Column(Text, nullable=True)
    status = Column(String(50), default="COMPLETED") # COMPLETED, ACTIVE, CANCELLED

    zone = relationship("GardenZone", back_populates="irrigation_logs")


class IrrigationSchedule(Base):
    __tablename__ = "irrigation_schedules"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("garden_zones.id"), nullable=False)
    zone_name = Column(String(100), nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=15)
    estimated_water_liters = Column(Float, default=50.0)
    priority = Column(String(20), default="NORMAL") # HIGH, NORMAL, LOW
    status = Column(String(20), default="PENDING")   # PENDING, COMPLETED, SKIPPED
    skip_reason = Column(String(255), nullable=True)
    ai_confidence = Column(Float, default=0.92)      # 0.0 to 1.0
    rain_prob_predicted = Column(Float, default=0.0) # %
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    zone = relationship("GardenZone", back_populates="schedules")


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("garden_zones.id"), nullable=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    urgency = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    category = Column(String(50), default="WATER_SAVING") # WATER_SAVING, HEALTH_RISK, WEATHER_ALERT, SCHEDULE_OPTIMIZATION
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    zone = relationship("GardenZone", back_populates="recommendations")

