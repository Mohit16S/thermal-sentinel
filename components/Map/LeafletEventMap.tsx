'use client';

import {useEffect, useMemo, useState} from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import {Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap} from 'react-leaflet';
import type {Event, IndustrialFeature, Risk} from '@/types';
import type {EventMapProps} from './EventMap';

const INDIA_CENTER: L.LatLngExpression = [22.5, 79];
const RISK_COLORS: Record<Risk, string> = {
  CRITICAL: '#ff5151',
  HIGH: '#ff963c',
  MEDIUM: '#f1d35e',
  LOW: '#50cf83',
};

function FitEventBounds({events}: {events: Event[]}) {
  const map = useMap();
  const coordinateKey = events.map(event => `${event.latitude},${event.longitude}`).join('|');

  useEffect(() => {
    if (!events.length) {
      map.setView(INDIA_CENTER, 5);
      return;
    }
    if (events.length === 1) {
      map.setView([events[0].latitude, events[0].longitude], 11);
      return;
    }
    map.fitBounds(L.latLngBounds(events.map(event => [event.latitude, event.longitude])), {
      padding: [48, 48],
      maxZoom: 10,
    });
  }, [coordinateKey, events, map]);

  return null;
}

function popupContent(event: Event) {
  const root = document.createElement('div');
  root.className = 'thermal-popup';
  const title = document.createElement('strong');
  title.textContent = event.event_id;
  const classification = document.createElement('span');
  classification.textContent = event.classification;
  const details = document.createElement('dl');
  const entries = [
    ['Risk', `${event.risk_level} · ${event.risk_score}/100`],
    ['Confidence', `${event.classification_confidence}%`],
    ['Persistence', event.persistence_label],
    ['Brightness', `${event.max_brightness} K`],
    ['Observations', String(event.observation_count)],
  ];
  for (const [label, value] of entries) {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    row.append(term, description);
    details.append(row);
  }
  const link = document.createElement('a');
  link.href = `/investigation/${encodeURIComponent(event.event_id)}`;
  link.textContent = 'Investigate Event →';
  root.append(title, classification, details, link);
  return root;
}

function ClusteredEvents({events, selected, onSelect}: EventMapProps) {
  const map = useMap();

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 54,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: group => L.divIcon({
        className: 'thermal-cluster',
        html: `<span>${group.getChildCount()}</span>`,
        iconSize: L.point(38, 38),
      }),
    });

    for (const event of events) {
      const marker = L.circleMarker([event.latitude, event.longitude], {
        radius: selected === event.event_id ? 10 : 8,
        color: selected === event.event_id ? '#ffffff' : RISK_COLORS[event.risk_level],
        weight: selected === event.event_id ? 3 : 2,
        fillColor: RISK_COLORS[event.risk_level],
        fillOpacity: 0.92,
      });
      marker.bindPopup(popupContent(event), {maxWidth: 270});
      if (onSelect) marker.on('click', () => onSelect(event));
      cluster.addLayer(marker);
    }

    map.addLayer(cluster);
    return () => {
      map.removeLayer(cluster);
      cluster.clearLayers();
    };
  }, [events, map, onSelect, selected]);

  return null;
}

function uniqueIndustrialFeatures(events: Event[]) {
  const features = new Map<string, IndustrialFeature>();
  for (const event of events) {
    const feature = event.nearest_industrial_feature;
    if (feature && Number.isFinite(feature.latitude) && Number.isFinite(feature.longitude)) {
      features.set(feature.id || `${feature.latitude},${feature.longitude}`, feature);
    }
  }
  return [...features.values()];
}

export default function LeafletEventMap({events, selected, onSelect}: EventMapProps) {
  const [showThermalHalos, setShowThermalHalos] = useState(true);
  const [showIndustry, setShowIndustry] = useState(true);
  const industrialFeatures = useMemo(() => uniqueIndustrialFeatures(events), [events]);

  return <div className="panel relative h-full min-h-64 overflow-hidden" aria-label="Thermal event map">
    <MapContainer center={INDIA_CENTER} zoom={5} minZoom={3} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitEventBounds events={events}/>
      {showThermalHalos && events.map(event => <Circle
        key={`halo-${event.event_id}`}
        center={[event.latitude, event.longitude]}
        radius={700 + event.risk_score * 24}
        pathOptions={{color: RISK_COLORS[event.risk_level], fillColor: RISK_COLORS[event.risk_level], fillOpacity: 0.08, opacity: 0.18, weight: 1}}
        interactive={false}
      />)}
      {showIndustry && industrialFeatures.map(feature => <CircleMarker
        key={`industry-${feature.id}`}
        center={[feature.latitude, feature.longitude]}
        radius={6}
        pathOptions={{color: '#87e8ff', fillColor: '#1689a7', fillOpacity: 0.9, weight: 2, dashArray: '3 2'}}
      ><Popup><div className="thermal-popup"><strong>{feature.name}</strong><span>OSM industrial context · {feature.type.replaceAll('_', ' ')}</span></div></Popup></CircleMarker>)}
      <ClusteredEvents events={events} selected={selected} onSelect={onSelect}/>
    </MapContainer>

    <div className="absolute left-3 top-3 z-[500] flex gap-2" aria-label="Map layer controls">
      <button type="button" aria-pressed={showThermalHalos} onClick={() => setShowThermalHalos(value => !value)} className={`map-layer-button ${showThermalHalos ? 'active' : ''}`}>Thermal halos</button>
      <button type="button" aria-pressed={showIndustry} onClick={() => setShowIndustry(value => !value)} className={`map-layer-button ${showIndustry ? 'active' : ''}`}>Industrial context</button>
    </div>
    <div className="map-legend absolute bottom-7 left-3 z-[500]">
      <div className="eyebrow mb-2">Risk level</div>
      {(Object.keys(RISK_COLORS) as Risk[]).map(risk => <span key={risk}><i style={{background: RISK_COLORS[risk]}}/>{risk}</span>)}
      <span><i className="industrial-key"/>INDUSTRIAL FEATURE</span>
    </div>
    {!events.length && <div className="pointer-events-none absolute inset-x-0 top-16 z-[500] mx-auto w-fit rounded border border-[#29454c] bg-[#081519]/95 px-4 py-2 text-xs text-[#b8c9cc]">No events match the current filters. Showing India.</div>}
  </div>;
}
