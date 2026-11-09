import asyncio
import datetime
import random
from typing import List, Dict, Any, Set
from fastapi import WebSocket
from sqlalchemy.orm import Session
import models
from database import SessionLocal

class ConnectionManager:
    """Manages real-time WebSocket connections with frontend clients."""
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        disconnected = []
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        for dead in disconnected:
            self.active_connections.discard(dead)

connection_manager = ConnectionManager()

class IoTSimulatorService:
    """Simulates real-world soil physics, evapotranspiration, and automated valve shutoffs."""
    def __init__(self):
        self.is_running: bool = False
        self.task: asyncio.Task = None
        self.rain_mode: bool = False
        self.heatwave_mode: bool = False

    async def start(self):
        if not self.is_running:
            self.is_running = True
            self.task = asyncio.create_task(self._simulation_loop())

    async def stop(self):
        self.is_running = False
        if self.task:
            self.task.cancel()

    async def _simulation_loop(self):
        while self.is_running:
            try:
                await self.tick_simulation()
            except Exception as e:
                print(f"[IoT Simulator] Tick error: {e}")
            await asyncio.sleep(4) # Run tick every 4 seconds

    async def tick_simulation(self):
        db: Session = SessionLocal()
        try:
            zones = db.query(models.GardenZone).all()
            now = datetime.datetime.utcnow()
            updated_zones = []

            for zone in zones:
                moisture_delta = 0.0
                temp_delta = random.uniform(-0.15, 0.15)
                humidity_delta = random.uniform(-0.3, 0.3)

                # Check if valve is active (Watering)
                if zone.valve_state == "OPEN":
                    # Increasing moisture while watering
                    moisture_delta = random.uniform(1.2, 2.4)
                    new_moisture = min(98.0, zone.soil_moisture + moisture_delta)
                    zone.soil_moisture = round(new_moisture, 1)

                    # Check auto-shutoff conditions
                    elapsed_min = 0
                    if zone.valve_opened_at:
                        elapsed_min = (now - zone.valve_opened_at).total_seconds() / 60.0

                    target_dur = zone.valve_target_duration or 15
                    if elapsed_min >= target_dur or zone.soil_moisture >= zone.max_moisture_threshold:
                        # Close valve!
                        zone.valve_state = "CLOSED"
                        zone.last_watered_at = now
                        duration_done = max(1, int(round(elapsed_min)))
                        vol_liters = round(duration_done * 15.0, 1)

                        # Create log
                        log_entry = models.IrrigationLog(
                            zone_id=zone.id,
                            zone_name=zone.name,
                            start_time=zone.valve_opened_at or (now - datetime.timedelta(minutes=duration_done)),
                            end_time=now,
                            duration_minutes=duration_done,
                            water_volume_liters=vol_liters,
                            water_saved_liters=round(vol_liters * 0.22, 1),
                            trigger_type="AUTOMATED_TIMER",
                            reason=f"Reached field capacity target ({zone.soil_moisture:.1f}%). Auto shutoff executed.",
                            status="COMPLETED"
                        )
                        db.add(log_entry)
                else:
                    # Valve CLOSED: natural evapotranspiration soil drying
                    dry_rate = random.uniform(0.08, 0.22)
                    if self.heatwave_mode:
                        dry_rate *= 2.5
                        zone.temperature = min(42.0, max(33.0, zone.temperature + 0.3))
                        zone.humidity = max(25.0, zone.humidity - 0.5)

                    if self.rain_mode:
                        # Rain wets the soil
                        moisture_delta = random.uniform(1.5, 3.5)
                        zone.humidity = min(98.0, zone.humidity + 1.2)
                        zone.temperature = max(20.0, zone.temperature - 0.2)
                    else:
                        moisture_delta = -dry_rate

                    new_moisture = max(8.0, min(95.0, zone.soil_moisture + moisture_delta))
                    zone.soil_moisture = round(new_moisture, 1)

                # Microclimate fluctuations
                zone.temperature = round(max(15.0, min(45.0, zone.temperature + temp_delta)), 1)
                zone.humidity = round(max(20.0, min(99.0, zone.humidity + humidity_delta)), 1)

                # Record periodic sensor reading
                reading = models.SensorReading(
                    zone_id=zone.id,
                    moisture=zone.soil_moisture,
                    temperature=zone.temperature,
                    humidity=zone.humidity,
                    light_intensity=zone.light_intensity,
                    timestamp=now
                )
                db.add(reading)
                updated_zones.append({
                    "id": zone.id,
                    "name": zone.name,
                    "moisture": zone.soil_moisture,
                    "temperature": zone.temperature,
                    "humidity": zone.humidity,
                    "valve_state": zone.valve_state
                })

            db.commit()

            # Broadcast update via WebSocket to connected clients
            await connection_manager.broadcast({
                "type": "SENSOR_TICK",
                "timestamp": now.isoformat(),
                "zones": updated_zones,
                "rain_mode": self.rain_mode,
                "heatwave_mode": self.heatwave_mode
            })
        finally:
            db.close()

iot_simulator = IoTSimulatorService()

