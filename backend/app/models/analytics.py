from __future__ import annotations
from dataclasses import dataclass
from math import asin, cos, radians, sin, sqrt
from typing import Iterable


def haversine_km(a_lat: float, a_lon: float, b_lat: float, b_lon: float) -> float:
    p1, p2 = radians(a_lat), radians(b_lat)
    dp, dl = radians(b_lat-a_lat), radians(b_lon-a_lon)
    h = sin(dp/2)**2 + cos(p1)*cos(p2)*sin(dl/2)**2
    return 6371.0088 * 2 * asin(sqrt(h))


def validate_coordinate(lat: float, lon: float) -> bool:
    return -90 <= lat <= 90 and -180 <= lon <= 180


def persistence_score(observations: int, active_days: int, span_days: int) -> tuple[float, str]:
    if observations <= 1 or active_days <= 1:
        return 0.0, "TRANSIENT"
    recurrence = min(active_days / max(span_days, 1), 1)
    score = min(100, observations * 3 + active_days * 4 + span_days * .5 + recurrence * 20)
    label = "HIGHLY PERSISTENT" if score >= 76 else "PERSISTENT" if score >= 51 else "RECURRING" if score >= 26 else "TRANSIENT"
    return round(score, 1), label


def anomaly_score(brightness: float, regional_mean: float, density: float, recurrence: float) -> float:
    deviation = max(0, min(1, (brightness-regional_mean)/120))
    return round(min(100, 55*deviation + 20*(1-min(density, 1)) + 25*recurrence), 1)


def classify(features: dict) -> tuple[str, float, list[str]]:
    p, industrial, b = features["persistence_score"], features["industrial_context_score"], features["max_brightness"]
    land = features.get("land_use", "unknown")
    evidence = [f'{features["observation_count"]} thermal observations', f'maximum brightness {b:.0f} K']
    if industrial >= 65:
        evidence.append(f'industrial context score {industrial:.0f}/100')
        if p >= 55:
            return "PERSISTENT INDUSTRIAL THERMAL SOURCE", min(94, 62+p*.2+industrial*.15), evidence + ["repeated activity across multiple days"]
        if b >= 395:
            return "INDUSTRIAL FIRE", min(93, 68+(b-395)*.15+industrial*.1), evidence + ["exceptionally elevated short-duration thermal signal"]
        return "POSSIBLE INFRASTRUCTURE / ENERGY SOURCE", 71, evidence
    if land == "vegetation":
        return "WILDFIRE / VEGETATION FIRE", 84, evidence + ["vegetation land-use context", "no significant industrial feature nearby"]
    if land == "agriculture":
        return "AGRICULTURAL BURNING", 78, evidence + ["agricultural land-use context", "moderate recurring signal"]
    return "OTHER / UNKNOWN", 48, evidence + ["insufficient corroborating context"]


WEIGHTS = {"intensity": .20, "confidence": .15, "persistence": .20, "industrial": .20, "size": .10, "recurrence": .10, "anomaly": .05}


def risk_score(f: dict) -> tuple[float, str, str]:
    parts = {
        "intensity": min(100, max(0, (f["max_brightness"]-280)/1.5)), "confidence": f["mean_confidence"],
        "persistence": f["persistence_score"], "industrial": f["industrial_context_score"],
        "size": min(100, f["spatial_extent_km2"]*35), "recurrence": f["recurrence_rate"]*100,
        "anomaly": f["anomaly_score"],
    }
    score = round(sum(parts[k]*WEIGHTS[k] for k in WEIGHTS), 1)
    level = "CRITICAL" if score >= 76 else "HIGH" if score >= 51 else "MEDIUM" if score >= 26 else "LOW"
    drivers = sorted(parts, key=parts.get, reverse=True)[:3]
    explanation = f"Risk {score:.0f}/100 driven by " + ", ".join(d.replace("_", " ") for d in drivers) + "."
    return score, level, explanation
