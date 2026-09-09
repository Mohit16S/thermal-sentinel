from fastapi.testclient import TestClient
from app.main import app
c=TestClient(app)
def test_health(): assert c.get('/api/health').status_code==200
def test_events():
    r=c.get('/api/events'); assert r.status_code==200 and len(r.json())==32
def test_missing_event(): assert c.get('/api/events/nope').status_code==404
def test_report_formats():
    for fmt in ('pdf','json','csv'): assert c.post(f'/api/reports/TS-2026-0001/generate?format={fmt}').status_code==200
