from fastapi import APIRouter, HTTPException
from ..models.schema import IncidentSignal, Context
from ..services.reconstruct import ReconstructService
from .ingest import dna_service, ghost_registry # Shared instances

router = APIRouter(prefix="/api/v1")

# We need the graph engine from a shared place, let's assume it's global for now
from ..services.graph import CausalGraphEngine
graph_engine = CausalGraphEngine()

reconstruct_service = ReconstructService(dna_service, graph_engine, ghost_registry)

@router.post("/reconstruct", response_model=Context)
async def reconstruct_incident(signal: IncidentSignal, mode: str = "fast"):
    try:
        context = reconstruct_service.reconstruct(signal, mode=mode)
        return context
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
