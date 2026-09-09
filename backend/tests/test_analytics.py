from app.models.analytics import validate_coordinate,persistence_score,anomaly_score,classify,risk_score,haversine_km

def test_coordinates():
    assert validate_coordinate(21.1,81.3)
    assert not validate_coordinate(91,0)
    assert not validate_coordinate(0,-181)

def test_single_detection_is_transient(): assert persistence_score(1,1,1)==(0.0,"TRANSIENT")
def test_persistence_repeated():
    score,label=persistence_score(14,9,18); assert score>50 and label in {"PERSISTENT","HIGHLY PERSISTENT"}
def test_anomaly_is_bounded(): assert 0<=anomaly_score(999,300,0,1)<=100
def test_industrial_classification_explained():
    c,confidence,evidence=classify({"persistence_score":80,"industrial_context_score":90,"max_brightness":390,"observation_count":14,"land_use":"industrial"}); assert c=="PERSISTENT INDUSTRIAL THERMAL SOURCE" and evidence
def test_risk_score_explained():
    s,l,x=risk_score({"max_brightness":450,"mean_confidence":95,"persistence_score":80,"industrial_context_score":90,"spatial_extent_km2":2,"recurrence_rate":.8,"anomaly_score":85}); assert s>75 and l=="CRITICAL" and "Risk" in x
def test_haversine(): assert haversine_km(0,0,0,1)==pytest.approx(111.2,rel=.01)

import pytest
