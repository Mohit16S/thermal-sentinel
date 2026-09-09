from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from app.config import get_settings
from app.services.demo_data import EVENTS, FACILITIES
from app.services.report_service import pdf_report, json_report, csv_report

settings=get_settings(); app=FastAPI(title=settings.app_name,version="0.1.0",description="Explainable geospatial thermal-event decision support")
app.add_middleware(CORSMiddleware,allow_origins=settings.cors_origins.split(','),allow_credentials=True,allow_methods=['*'],allow_headers=['*'])

def get_event(event_id):
    event=next((e for e in EVENTS if e["event_id"]==event_id),None)
    if not event: raise HTTPException(404,"Event not found")
    return event

@app.get("/api/health")
def health(): return {"status":"healthy","mode":"demo","source_status":{"firms":"demo adapter","osm":"cached demo context","satellite":"unavailable"}}
@app.get("/api/dashboard/stats")
def stats():
    return {"thermal_observations":127,"total_events":len(EVENTS),"significant_events":11,"high_risk_events":sum(e["risk_level"] in ("HIGH","CRITICAL") for e in EVENTS),"critical_events":sum(e["risk_level"]=="CRITICAL" for e in EVENTS),"suspected_industrial_events":sum("INDUSTRIAL" in e["classification"] for e in EVENTS),"persistent_sources":sum(e["persistence_score"]>=51 for e in EVENTS),"mode":"SYNTHETIC DEMONSTRATION DATA"}
@app.get("/api/events")
def events(risk: str|None=None, classification: str|None=None):
    data=EVENTS
    if risk: data=[e for e in data if e["risk_level"]==risk.upper()]
    if classification: data=[e for e in data if classification.lower() in e["classification"].lower()]
    return data
@app.get("/api/events/high-risk")
def high_risk(): return [e for e in EVENTS if e["risk_level"] in ("HIGH","CRITICAL")]
@app.get("/api/events/{event_id}")
def event(event_id:str): return get_event(event_id)
@app.get("/api/events/{event_id}/history")
def history(event_id:str): return get_event(event_id)["history"]
@app.get("/api/events/{event_id}/context")
def context(event_id:str):
    e=get_event(event_id); return {"industrial_context_score":e["industrial_context_score"],"distance_to_industry_km":e["distance_to_industry_km"],"nearest_feature":e["nearest_industrial_feature"],"facilities":FACILITIES}
@app.get("/api/events/{event_id}/satellite")
def satellite(event_id:str): return get_event(event_id)["satellite"]
@app.get("/api/events/{event_id}/analysis")
def analysis(event_id:str):
    e=get_event(event_id); return {k:e[k] for k in ["classification","classification_confidence","evidence","risk_score","risk_level","risk_explanation","persistence_score","anomaly_score"]}
@app.post("/api/events/run-analysis")
def run_analysis(): return {"status":"complete","events_analyzed":len(EVENTS),"mode":"RULE-BASED DEMO"}
@app.get("/api/reports/{event_id}")
def report_data(event_id:str): return get_event(event_id)
@app.post("/api/reports/{event_id}/generate")
def report(event_id:str,format:str=Query("pdf",pattern="^(pdf|json|csv)$")):
    e=get_event(event_id); makers={"pdf":pdf_report,"json":json_report,"csv":csv_report}; media={"pdf":"application/pdf","json":"application/json","csv":"text/csv"}
    return Response(makers[format](e),media_type=media[format],headers={"Content-Disposition":f'attachment; filename="{event_id}.{format}"'})
