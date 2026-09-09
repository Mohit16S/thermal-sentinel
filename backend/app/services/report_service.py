import csv, io, json
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

def json_report(event): return json.dumps(event, indent=2).encode()
def csv_report(event):
    out=io.StringIO(); flat={k:v for k,v in event.items() if not isinstance(v,(dict,list))}; w=csv.DictWriter(out,fieldnames=flat.keys()); w.writeheader(); w.writerow(flat); return out.getvalue().encode()
def pdf_report(event):
    out=io.BytesIO(); doc=SimpleDocTemplate(out,pagesize=A4); s=getSampleStyleSheet(); story=[Paragraph("THERMAL SENTINEL INCIDENT REPORT",s["Title"]),Paragraph("SYNTHETIC DEMONSTRATION DATA · DECISION SUPPORT ONLY",s["Heading3"]),Spacer(1,12)]
    rows=[["Event ID",event["event_id"]],["Location",f'{event["latitude"]}, {event["longitude"]}'],["Classification",event["classification"]],["Classification confidence",f'{event["classification_confidence"]}%'],["Risk",f'{event["risk_score"]}/100 · {event["risk_level"]}'],["Thermal intensity",f'{event["max_brightness"]} K max'],["Persistence",f'{event["persistence_label"]} · {event["persistence_score"]}/100'],["Anomaly score",f'{event["anomaly_score"]}/100'],["Industrial proximity",f'{event["distance_to_industry_km"]} km'],["Nearby OSM feature",event["nearest_industrial_feature"]["name"]]]
    t=Table(rows,colWidths=[150,360]); t.setStyle(TableStyle([("GRID",(0,0),(-1,-1),.4,colors.grey),("BACKGROUND",(0,0),(0,-1),colors.HexColor("#e8eef2")),("VALIGN",(0,0),(-1,-1),"TOP"),('PADDING',(0,0),(-1,-1),7)])); story += [t,Spacer(1,14),Paragraph("AI assessment",s["Heading2"]),Paragraph(event["risk_explanation"],s["BodyText"]),Spacer(1,8),Paragraph("Evidence",s["Heading2"])]+[Paragraph("• "+x,s["BodyText"]) for x in event["evidence"]]+[Spacer(1,8),Paragraph("Recommended action",s["Heading2"]),Paragraph("Prioritize for satellite and field verification." if event["risk_level"] in ["HIGH","CRITICAL"] else "Monitor for recurrence.",s["BodyText"]),Spacer(1,8),Paragraph("Data sources & limitations",s["Heading2"]),Paragraph("Bundled synthetic FIRMS-like observations and demonstration OSM context. No fire is confirmed. Classification is an explainable rule-based baseline, not a trained ML prediction. Satellite imagery was not available.",s["BodyText"])]
    doc.build(story); return out.getvalue()
