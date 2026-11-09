import asyncio
import httpx
from main import app
from iot_service import iot_simulator

async def run_tests():
    print("=== Testing Smart Irrigation Agent Backend Endpoints ===")
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Get Zones
        res = await client.get("/api/zones")
        assert res.status_code == 200, f"Zones failed: {res.text}"
        zones = res.json()
        print(f"[PASS] /api/zones -> Found {len(zones)} campus zones:")
        for z in zones:
            print(f"       - {z['name']}: {z['soil_moisture']}% moisture, Valve: {z['valve_state']}")

        # 2. Dashboard Stats
        res = await client.get("/api/dashboard/stats")
        assert res.status_code == 200, f"Stats failed: {res.text}"
        data = res.json()
        print(f"[PASS] /api/dashboard/stats -> Zones: {data['total_zones']}, Avg Moisture: {data['avg_soil_moisture']}%, Water Saved: {data['water_saved_liters']} L")

        # 3. AI Schedule Optimizer
        res = await client.post("/api/schedules/run-optimizer")
        assert res.status_code == 200
        optimizer_res = res.json()
        print(f"[PASS] /api/schedules/run-optimizer -> Evaluated {len(optimizer_res['evaluations'])} zones")

        # 4. Check Schedules
        res = await client.get("/api/schedules")
        assert res.status_code == 200
        schedules = res.json()
        print(f"[PASS] /api/schedules -> Generated {len(schedules)} AI irrigation schedules")

        # 5. Manual Valve Toggle Test
        zone_id = zones[0]["id"]
        res = await client.post(f"/api/zones/{zone_id}/valve/open", json={"duration_minutes": 10})
        assert res.status_code == 200
        print(f"[PASS] Open valve zone {zone_id} -> {res.json()['message']}")

        res = await client.post(f"/api/zones/{zone_id}/valve/close")
        assert res.status_code == 200
        print(f"[PASS] Close valve zone {zone_id} -> {res.json()['message']}")

        # 6. AI Chat Assistant Test
        res = await client.post("/api/ai/chat", json={"message": "How much water did we save this week?"})
        assert res.status_code == 200
        chat_data = res.json()
        print(f"[PASS] AI Chat Assistant Reply snippet -> {chat_data['reply'][:85]}...")

        # 7. Weather
        res = await client.get("/api/weather/current")
        assert res.status_code == 200
        weather = res.json()
        print(f"[PASS] Weather -> Temp: {weather['temperature']}°C, Rain Prob: {weather['rain_probability']}%")

        # 8. ESP32 Telemetry Ingestion
        esp_payload = {
            "zone_id": zone_id,
            "moisture": 45.0,
            "temperature": 26.8,
            "humidity": 62.0,
            "light_intensity": 900.0,
            "battery_level": 98.0
        }
        res = await client.post("/api/iot/sensors", json=esp_payload)
        assert res.status_code == 200
        print(f"[PASS] ESP32 Ingestion -> Status: {res.json()['status']}, Valve Command: {res.json()['valve_state']}")

    await iot_simulator.stop()
    print("\nALL BACKEND API & AI INTEGRATION TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    asyncio.run(run_tests())
