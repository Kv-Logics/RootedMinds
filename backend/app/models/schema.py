from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

class Event(BaseModel):
    ts: str
    kind: Literal["deploy", "log", "metric", "trace", "topology", "incident_signal", "remediation"]
    service: Optional[str] = None
    # Deploy specific
    version: Optional[str] = None
    actor: Optional[str] = None
    # Log/Metric specific
    level: Optional[str] = None
    msg: Optional[str] = None
    name: Optional[str] = None
    value: Optional[float] = None
    # Trace specific
    trace_id: Optional[str] = None
    spans: Optional[List[Dict[str, Any]]] = None
    # Topology specific
    change: Optional[str] = None
    from_service: Optional[str] = Field(None, alias="from")
    to_service: Optional[str] = Field(None, alias="to")
    # Incident/Remediation specific
    incident_id: Optional[str] = None
    trigger: Optional[str] = None
    action: Optional[str] = None
    target: Optional[str] = None
    outcome: Optional[str] = None

class CausalEdge(BaseModel):
    cause_id: str
    effect_id: str
    evidence: str
    confidence: float

class IncidentMatch(BaseModel):
    past_incident_id: str
    similarity: float
    rationale: str

class Remediation(BaseModel):
    action: str
    target: str
    historical_outcome: str
    confidence: float

class Context(BaseModel):
    related_events: List[Dict[str, Any]]
    causal_chain: List[CausalEdge]
    similar_past_incidents: List[IncidentMatch]
    suggested_remediations: List[Remediation]
    confidence: float
    explain: str

class IncidentSignal(BaseModel):
    ts: str
    incident_id: str
    trigger: str
    service: Optional[str] = None
