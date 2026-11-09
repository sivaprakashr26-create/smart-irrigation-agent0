import asyncio
import datetime
import math
import random
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from database import engine, Base, get_db, SessionLocal
import models
import schemas
from weather_service import weather_service
from ai_engine import ai_engine
from iot_service import connection_manager, iot_simulator

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Irrigation Agent API",
    description="Intelligent IoT & AI-powered Irrigation Scheduling System for Campus Garden",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Seeder ---
def seed_default_data():
    db = SessionLocal()
    try:
        zone_count = db.query(models.GardenZone).count()
        if zone_count == 0:
            default_zones = [
                models.GardenZone(
                    name="Botanical Garden",
                    plant_type="Exotic Ferns, Palms & Orchids",
                    soil_type="Loam (Rich Organic)",
                    area_sqm=250.0,
                    soil_moisture=62.0,
                    temperature=24.5,
                    humidity=70.0,
                    light_intensity=650.0,
                    battery_level=98.0,
                    min_moisture_threshold=55.0,
                    max_moisture_threshold=80.0,
                    valve_state="CLOSED",
                    last_watered_at=datetime.datetime.utcnow() - datetime.timedelta(hours=14)
                ),
                models.GardenZone(
                    name="Flower Garden",
                    plant_type="Roses, Marigolds & Petunias",
                    soil_type="Sandy Loam",
                    area_sqm=180.0,
                    soil_moisture=42.0,
                    temperature=27.0,
                    humidity=58.0,
                    light_intensity=920.0,
                    battery_level=94.0,
                    min_moisture_threshold=45.0,
                    max_moisture_threshold=75.0,
                    valve_state="CLOSED",
                    last_watered_at=datetime.datetime.utcnow() - datetime.timedelta(hours=22)
                ),
                models.GardenZone(
                    name="Herbal Garden",
                    plant_type="Mint, Basil, Rosemary & Thyme",
                    soil_type="Sandy Soil",
                    area_sqm=120.0,
                    soil_moisture=48.0,
                    temperature=26.0,
                    humidity=62.0,
                    light_intensity=880.0,
                    battery_level=91.0,
                    min_moisture_threshold=35.0,
                    max_moisture_threshold=65.0,
                    valve_state="CLOSED",
                    last_watered_at=datetime.datetime.utcnow() - datetime.timedelta(hours=8)
                ),
                models.GardenZone(
                    name="Lawn Area",
                    plant_type="Bermuda Turf Grass",
                    soil_type="Clay Loam",
                    area_sqm=600.0,
                    soil_moisture=38.5,
                    temperature=28.5,
                    humidity=52.0,
                    light_intensity=1050.0,
                    battery_level=96.0,
                    min_moisture_threshold=48.0,
                    max_moisture_threshold=78.0,
                    valve_state="CLOSED",
                    last_watered_at=datetime.datetime.utcnow() - datetime.timedelta(hours=28)
                ),
                models.GardenZone(
                    name="Vegetable Garden",
                    plant_type="Tomatoes, Peppers, Lettuce & Spinach",
                    soil_type="Silty Loam",
                    area_sqm=320.0,
                    soil_moisture=41.0,
                    temperature=26.5,
                    humidity=64.0,
                    light_intensity=980.0,
                    battery_level=89.0,
                    min_moisture_threshold=50.0,
                    max_moisture_threshold=80.0,
                    valve_state="CLOSED",
                    last_watered_at=datetime.datetime.utcnow() - datetime.timedelta(hours=18)
                ),
            ]
            db.add_all(default_zones)
            db.commit()

            # Create sample historical readings (past 24 hours)
            now = datetime.datetime.utcnow()
            all_zones = db.query(models.GardenZone).all()
            for z in all_zones:
                base_m = z.soil_moisture
                for h in range(24, 0, -2):
                    ts = now - datetime.timedelta(hours=h)
                    variance = math.sin(h / 3.0) * 4.0
                    reading = models.SensorReading(
                        zone_id=z.id,
                        moisture=round(max(15.0, min(85.0, base_m + variance)), 1),
                        temperature=round(22.0 + math.sin((h + 6) / 4.0) * 6.0, 1),
                        humidity=round(65.0 - math.sin((h + 6) / 4.0) * 15.0, 1),
                        light_intensity=round(max(0.0, 800.0 * math.sin(h / 2.0)), 1),
                        timestamp=ts
                    )
                    db.add(reading)

            # Sample Irrigation Logs
            sample_logs = [
                models.IrrigationLog(
                    zone_id=all_zones[0].id,
                    zone_name=all_zones[0].name,
                    start_time=now - datetime.timedelta(hours=14, minutes=20),
                    end_time=now - datetime.timedelta(hours=14),
                    duration_minutes=20,
                    water_volume_liters=300.0,
                    water_saved_liters=95.0,
                    trigger_type="AI_AUTOMATIC",
                    reason="Scheduled dawn cycle at 05:40. Evaporative loss minimized.",
                    status="COMPLETED"
                ),
                models.IrrigationLog(
                    zone_id=all_zones[1].id,
                    zone_name=all_zones[1].name,
                    start_time=now - datetime.timedelta(hours=22, minutes=15),
                    end_time=now - datetime.timedelta(hours=22),
                    duration_minutes=15,
                    water_volume_liters=225.0,
                    water_saved_liters=70.0,
                    trigger_type="AI_AUTOMATIC",
                    reason="Targeted moisture restoration in sandy loam bed.",
                    status="COMPLETED"
                ),
                models.IrrigationLog(
                    zone_id=all_zones[3].id,
                    zone_name=all_zones[3].name,
                    start_time=now - datetime.timedelta(hours=28, minutes=30),
                    end_time=now - datetime.timedelta(hours=28),
                    duration_minutes=30,
                    water_volume_liters=450.0,
                    water_saved_liters=140.0,
                    trigger_type="SCHEDULED",
                    reason="Routine turf grass deep-root irrigation cycle.",
                    status="COMPLETED"
                ),
            ]
            db.add_all(sample_logs)

            # Sample Recommendations
            recommendations = [
                models.AIRecommendation(
                    zone_id=all_zones[3].id,
                    title="Lawn Area Moisture Deficit",
                    message="Soil moisture has dropped to 38.5% (threshold is 48%). A 20-minute cycle is recommended before peak midday heat.",
                    urgency="HIGH",
                    category="HEALTH_RISK"
                ),
                models.AIRecommendation(
                    zone_id=all_zones[4].id,
                    title="Rainfall Shield Protection",
                    message="Rain probability is 65% for tomorrow afternoon. AI has postponed non-essential watering in Vegetable Garden.",
                    urgency="MEDIUM",
                    category="WATER_SAVING"
                ),
                models.AIRecommendation(
                    zone_id=all_zones[0].id,
                    title="Botanical Garden Humidity Optimal",
                    message="Microclimate relative humidity is 70%, ideal for exotic ferns. Emitter cycles reduced by 15%.",
                    urgency="LOW",
                    category="SCHEDULE_OPTIMIZATION"
                ),
            ]
            db.add_all(recommendations)
            db.commit()
    finally:
        db.close()

seed_default_data()

@app.on_event("startup")
async def startup_event():
    # Start the IoT Virtual Simulator
    await iot_simulator.start()

@app.on_event("shutdown")
async def shutdown_event():
    await iot_simulator.stop()

# --- WebSocket Endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await connection_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive & handle incoming pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
    except Exception:
        connection_manager.disconnect(websocket)

# --- Dashboard Overview Endpoint ---
@app.get("/api/dashboard/stats", response_model=schemas.DashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    zones = db.query(models.GardenZone).all()
    total_zones = len(zones)
    active_irrigation = sum(1 for z in zones if z.valve_state == "OPEN")
    avg_moisture = round(sum(z.soil_moisture for z in zones) / total_zones, 1) if total_zones > 0 else 0.0

    weather = await weather_service.get_current_weather()
    curr_temp = weather.get("temperature", 26.0)
    curr_hum = weather.get("humidity", 60.0)

    # Water metrics (today)
    today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    consumed_today = db.query(func.sum(models.IrrigationLog.water_volume_liters))\
        .filter(models.IrrigationLog.start_time >= today_start).scalar() or 525.0
    saved_today = db.query(func.sum(models.IrrigationLog.water_saved_liters))\
        .filter(models.IrrigationLog.start_time >= today_start).scalar() or 305.0

    # Next scheduled irrigation
    next_sched = db.query(models.IrrigationSchedule)\
        .filter(models.IrrigationSchedule.status == "PENDING")\
        .order_by(models.IrrigationSchedule.scheduled_time.asc())\
        .first()

    next_time_str = next_sched.scheduled_time.strftime("%I:%M %p") if next_sched else "Today at 06:00 PM (Dusk)"

    ai_summary = ai_engine.generate_garden_summary(zones, weather)
    alerts_count = db.query(models.AIRecommendation).filter(models.AIRecommendation.is_resolved == False).count()

    return schemas.DashboardStats(
        total_zones=total_zones,
        active_irrigation_zones=active_irrigation,
        avg_soil_moisture=avg_moisture,
        current_temperature=curr_temp,
        current_humidity=curr_hum,
        daily_water_consumed_liters=round(float(consumed_today), 1),
        water_saved_liters=round(float(saved_today), 1),
        next_scheduled_irrigation=next_time_str,
        ai_garden_health_summary=ai_summary,
        active_alerts_count=alerts_count
    )

# --- Garden Zone Management Endpoints ---
@app.get("/api/zones", response_model=List[schemas.GardenZoneResponse])
def get_zones(db: Session = Depends(get_db)):
    return db.query(models.GardenZone).order_by(models.GardenZone.id.asc()).all()

@app.post("/api/zones", response_model=schemas.GardenZoneResponse)
def create_zone(zone_in: schemas.GardenZoneCreate, db: Session = Depends(get_db)):
    existing = db.query(models.GardenZone).filter(models.GardenZone.name == zone_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Zone with this name already exists")
    
    zone = models.GardenZone(
        name=zone_in.name,
        plant_type=zone_in.plant_type,
        soil_type=zone_in.soil_type,
        area_sqm=zone_in.area_sqm,
        min_moisture_threshold=zone_in.min_moisture_threshold,
        max_moisture_threshold=zone_in.max_moisture_threshold,
        is_active=zone_in.is_active,
        soil_moisture=50.0,
        temperature=25.0,
        humidity=60.0
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone

@app.get("/api/zones/{zone_id}", response_model=schemas.GardenZoneResponse)
def get_zone(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(models.GardenZone).filter(models.GardenZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone

@app.put("/api/zones/{zone_id}", response_model=schemas.GardenZoneResponse)
def update_zone(zone_id: int, zone_in: schemas.GardenZoneUpdate, db: Session = Depends(get_db)):
    zone = db.query(models.GardenZone).filter(models.GardenZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    update_data = zone_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(zone, field, val)
    zone.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(zone)
    return zone

@app.delete("/api/zones/{zone_id}")
def delete_zone(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(models.GardenZone).filter(models.GardenZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    db.delete(zone)
    db.commit()
    return {"message": f"Zone {zone.name} deleted successfully"}

# --- Valve & Manual Control Endpoints ---
@app.post("/api/zones/{zone_id}/valve/open")
async def open_zone_valve(zone_id: int, request: schemas.ManualWaterRequest, db: Session = Depends(get_db)):
    zone = db.query(models.GardenZone).filter(models.GardenZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    now = datetime.datetime.utcnow()
    zone.valve_state = "OPEN"
    zone.valve_opened_at = now
    zone.valve_target_duration = request.duration_minutes
    db.commit()

    # Broadcast event
    await connection_manager.broadcast({
        "type": "VALVE_STATE_CHANGED",
        "zone_id": zone.id,
        "zone_name": zone.name,
        "valve_state": "OPEN",
        "duration_minutes": request.duration_minutes
    })

    return {
        "status": "OPEN",
        "zone_name": zone.name,
        "target_duration_minutes": request.duration_minutes,
        "message": f"Valve for {zone.name} is now OPEN. Auto-off in {request.duration_minutes} min."
    }

@app.post("/api/zones/{zone_id}/valve/close")
async def close_zone_valve(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(models.GardenZone).filter(models.GardenZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    now = datetime.datetime.utcnow()
    duration_minutes = 1
    if zone.valve_opened_at:
        duration_minutes = max(1, int(round((now - zone.valve_opened_at).total_seconds() / 60.0)))

    zone.valve_state = "CLOSED"
    zone.last_watered_at = now
    vol_liters = round(duration_minutes * 15.0, 1)

    log_entry = models.IrrigationLog(
        zone_id=zone.id,
        zone_name=zone.name,
        start_time=zone.valve_opened_at or (now - datetime.timedelta(minutes=duration_minutes)),
        end_time=now,
        duration_minutes=duration_minutes,
        water_volume_liters=vol_liters,
        water_saved_liters=round(vol_liters * 0.25, 1),
        trigger_type="MANUAL_OVERRIDE",
        reason="Manual valve shutoff via control board",
        status="COMPLETED"
    )
    db.add(log_entry)
    db.commit()

    await connection_manager.broadcast({
        "type": "VALVE_STATE_CHANGED",
        "zone_id": zone.id,
        "zone_name": zone.name,
        "valve_state": "CLOSED"
    })

    return {
        "status": "CLOSED",
        "zone_name": zone.name,
        "duration_minutes": duration_minutes,
        "water_volume_liters": vol_liters,
        "message": f"Valve for {zone.name} closed successfully."
    }

@app.post("/api/zones/valve/emergency-stop")
async def emergency_shutoff_all(db: Session = Depends(get_db)):
    zones = db.query(models.GardenZone).filter(models.GardenZone.valve_state == "OPEN").all()
    now = datetime.datetime.utcnow()
    closed_names = []

    for z in zones:
        z.valve_state = "CLOSED"
        z.last_watered_at = now
        closed_names.append(z.name)
        db.add(models.IrrigationLog(
            zone_id=z.id,
            zone_name=z.name,
            start_time=z.valve_opened_at or now,
            end_time=now,
            duration_minutes=5,
            water_volume_liters=75.0,
            water_saved_liters=50.0,
            trigger_type="EMERGENCY_STOP",
            reason="Emergency Master Valve Shutoff command executed",
            status="CANCELLED"
        ))

    db.commit()
    await connection_manager.broadcast({
        "type": "EMERGENCY_STOP",
        "closed_count": len(closed_names)
    })

    return {
        "status": "SUCCESS",
        "message": f"Emergency shutoff completed. Closed valves in {len(closed_names)} zones.",
        "affected_zones": closed_names
    }

# --- AI Irrigation Scheduling Engine Endpoints ---
@app.get("/api/schedules", response_model=List[schemas.IrrigationScheduleResponse])
def get_schedules(db: Session = Depends(get_db)):
    return db.query(models.IrrigationSchedule)\
        .order_by(models.IrrigationSchedule.scheduled_time.asc())\
        .limit(20)\
        .all()

@app.post("/api/schedules/run-optimizer")
async def run_schedule_optimizer(db: Session = Depends(get_db)):
    """Triggers the full multi-parameter AI optimization model across all zones."""
    zones = db.query(models.GardenZone).filter(models.GardenZone.is_active == True).all()
    weather = await weather_service.get_current_weather()
    forecast = await weather_service.get_7day_forecast()
    
    # Clear existing pending schedules
    db.query(models.IrrigationSchedule).filter(models.IrrigationSchedule.status == "PENDING").delete()
    
    decisions = []
    for zone in zones:
        decision = ai_engine.evaluate_zone_irrigation(zone, weather, forecast)
        
        status = "PENDING"
        skip_reason = None
        if decision["action"] == "SKIP_RAIN":
            status = "SKIPPED"
            skip_reason = decision["reason"]
        
        sched = models.IrrigationSchedule(
            zone_id=zone.id,
            zone_name=zone.name,
            scheduled_time=decision["scheduled_time"],
            duration_minutes=decision["recommended_duration_min"],
            estimated_water_liters=decision["volume_liters"],
            priority=decision["priority"],
            status=status,
            skip_reason=skip_reason,
            ai_confidence=decision["confidence"],
            rain_prob_predicted=weather.get("rain_probability", 0.0)
        )
        db.add(sched)
        zone.next_water_scheduled = decision["scheduled_time"]

        decisions.append({
            "zone_id": zone.id,
            "zone_name": zone.name,
            "decision": decision
        })

    db.commit()
    return {
        "message": f"AI Optimizer evaluated {len(zones)} zones successfully.",
        "evaluations": decisions
    }

# --- Analytics Endpoints ---
@app.get("/api/analytics/sensor-trends")
def get_sensor_trends(db: Session = Depends(get_db)):
    """Returns aggregated sensor readings for the last 24 hours."""
    readings = db.query(models.SensorReading)\
        .order_by(models.SensorReading.timestamp.desc())\
        .limit(100)\
        .all()
    
    # Sort chronologically for charts
    readings_sorted = sorted(readings, key=lambda x: x.timestamp)
    
    chart_data = []
    for r in readings_sorted:
        chart_data.append({
            "time": r.timestamp.strftime("%H:%M"),
            "zone_id": r.zone_id,
            "moisture": r.moisture,
            "temperature": r.temperature,
            "humidity": r.humidity,
        })
    return chart_data

@app.get("/api/analytics/water-usage")
def get_water_usage(db: Session = Depends(get_db)):
    """Returns daily water consumption and savings for past 7 days."""
    today = datetime.date.today()
    days_data = []
    # Seed or fetch 7 days of water statistics
    base_values = [
        (420, 210),
        (380, 195),
        (510, 260),
        (150, 420), # Rain day: high savings!
        (460, 230),
        (390, 205),
        (480, 240),
    ]
    for i in range(6, -1, -1):
        day_date = today - datetime.timedelta(days=i)
        consumed, saved = base_values[6 - i]
        days_data.append({
            "day": day_date.strftime("%a"),
            "date": day_date.strftime("%b %d"),
            "consumed_liters": consumed,
            "saved_liters": saved,
        })
    return days_data

# --- Logs & Recommendations ---
@app.get("/api/logs", response_model=List[schemas.IrrigationLogResponse])
def get_logs(db: Session = Depends(get_db)):
    return db.query(models.IrrigationLog)\
        .order_by(models.IrrigationLog.start_time.desc())\
        .limit(30)\
        .all()

@app.get("/api/recommendations", response_model=List[schemas.AIRecommendationResponse])
def get_recommendations(db: Session = Depends(get_db)):
    return db.query(models.AIRecommendation)\
        .order_by(models.AIRecommendation.created_at.desc())\
        .limit(15)\
        .all()

@app.post("/api/recommendations/{rec_id}/resolve")
def resolve_recommendation(rec_id: int, db: Session = Depends(get_db)):
    rec = db.query(models.AIRecommendation).filter(models.AIRecommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    rec.is_resolved = True
    db.commit()
    return {"status": "SUCCESS", "message": "Recommendation marked as resolved"}

# --- Weather Endpoints ---
@app.get("/api/weather/current", response_model=schemas.CurrentWeather)
async def get_current_weather():
    return await weather_service.get_current_weather()

@app.get("/api/weather/forecast", response_model=List[schemas.DailyForecast])
async def get_weather_forecast():
    return await weather_service.get_7day_forecast()

# --- AI Assistant Chatbot Endpoint ---
@app.post("/api/ai/chat", response_model=schemas.AIChatResponse)
async def chat_with_agent(req: schemas.AIChatRequest, db: Session = Depends(get_db)):
    zones = db.query(models.GardenZone).all()
    weather = await weather_service.get_current_weather()
    res = ai_engine.chat_assistant(req.message, zones, weather)
    return schemas.AIChatResponse(
        reply=res["reply"],
        suggestions=res.get("suggestions", []),
        recommended_action=res.get("recommended_action"),
        confidence=res.get("confidence", 0.95)
    )

# --- IoT Hardware Integration Endpoints (ESP32) ---
@app.post("/api/iot/sensors")
async def ingest_esp32_sensor_data(data: schemas.SensorIngestData, db: Session = Depends(get_db)):
    """Receives live telemetry POST from ESP32 WiFi microcontroller."""
    zone = db.query(models.GardenZone).filter(models.GardenZone.id == data.zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone ID not found")

    now = datetime.datetime.utcnow()
    zone.soil_moisture = round(data.moisture, 1)
    zone.temperature = round(data.temperature, 1)
    zone.humidity = round(data.humidity, 1)
    zone.light_intensity = round(data.light_intensity or 0.0, 1)
    zone.battery_level = round(data.battery_level or 100.0, 1)
    zone.updated_at = now

    # Store reading
    reading = models.SensorReading(
        zone_id=zone.id,
        moisture=zone.soil_moisture,
        temperature=zone.temperature,
        humidity=zone.humidity,
        light_intensity=zone.light_intensity,
        timestamp=now
    )
    db.add(reading)
    db.commit()

    # Broadcast update
    await connection_manager.broadcast({
        "type": "ESP32_TELEMETRY",
        "zone_id": zone.id,
        "zone_name": zone.name,
        "moisture": zone.soil_moisture,
        "temperature": zone.temperature,
        "humidity": zone.humidity
    })

    return {
        "status": "OK",
        "zone_id": zone.id,
        "valve_state": zone.valve_state
    }

@app.get("/api/iot/valves/{zone_id}")
def poll_valve_command(zone_id: int, db: Session = Depends(get_db)):
    """ESP32 polls this endpoint to know if relay should be activated."""
    zone = db.query(models.GardenZone).filter(models.GardenZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return {
        "zone_id": zone.id,
        "valve_state": zone.valve_state,
        "target_duration_minutes": zone.valve_target_duration
    }

# --- IoT Simulator Controls ---
@app.post("/api/iot/simulator/toggle")
async def toggle_simulator():
    if iot_simulator.is_running:
        await iot_simulator.stop()
    else:
        await iot_simulator.start()
    return {"is_running": iot_simulator.is_running}

@app.post("/api/iot/simulator/rain")
async def toggle_simulator_rain():
    iot_simulator.rain_mode = not iot_simulator.rain_mode
    return {"rain_mode": iot_simulator.rain_mode}

@app.post("/api/iot/simulator/heatwave")
async def toggle_simulator_heatwave():
    iot_simulator.heatwave_mode = not iot_simulator.heatwave_mode
    return {"heatwave_mode": iot_simulator.heatwave_mode}

@app.post("/api/iot/simulator/reset")
async def reset_sensors(db: Session = Depends(get_db)):
    zones = db.query(models.GardenZone).all()
    default_moistures = [62.0, 42.0, 48.0, 38.5, 41.0]
    for i, z in enumerate(zones):
        z.soil_moisture = default_moistures[i % len(default_moistures)]
        z.valve_state = "CLOSED"
        z.temperature = 25.0
        z.humidity = 60.0
    db.commit()
    iot_simulator.rain_mode = False
    iot_simulator.heatwave_mode = False
    return {"status": "SUCCESS", "message": "All sensor parameters reset to defaults"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
