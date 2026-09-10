export type Risk='CRITICAL'|'HIGH'|'MEDIUM'|'LOW';
export type PersistenceLabel='TRANSIENT'|'RECURRING'|'PERSISTENT'|'HIGHLY PERSISTENT';
export type DataMode='demo'|'live';
export interface IndustrialFeature {id:string;name:string;type:string;latitude:number;longitude:number}
export interface Observation {latitude:number;longitude:number;brightness:number;confidence:number;date:string;time:string;satellite:string;instrument:string;dayNight:'D'|'N'}
export interface RiskBreakdown {intensity:number;confidence:number;persistence:number;industrial:number;size:number;recurrence:number;anomaly:number}
export interface Event {event_id:string;latitude:number;longitude:number;observation_count:number;mean_brightness:number;max_brightness:number;mean_confidence:number;first_seen:string;last_seen:string;spatial_extent_km2:number;active_days:number;temporal_span_days:number;recurrence_rate:number;persistence_score:number;persistence_label:PersistenceLabel;anomaly_score:number;industrial_context_score:number;distance_to_industry_km:number;nearest_industrial_feature:IndustrialFeature;classification:string;classification_confidence:number;evidence:string[];risk_score:number;risk_level:Risk;risk_explanation:string;risk_breakdown:RiskBreakdown;history:{date:string;brightness:number;confidence:number}[];data_mode:string;satellite:{available:boolean;message:string}}
export interface DashboardStats {thermal_observations:number;total_events:number;significant_events:number;high_risk_events:number;critical_events:number;suspected_industrial_events:number;persistent_sources:number;mean_anomaly:number;mode:string}
export interface PipelineResult {events:Event[];stats:DashboardStats;mode:DataMode;sourceStatus:{firms:string;osm:string;satellite:string};warning?:string}
