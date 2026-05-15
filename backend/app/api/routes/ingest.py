from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
from ..models.schema import Event
from ..services.dna import DNAService
from ..services.ghost import GhostRegistry

router = APIRouter(prefix="/api/v1")

# These will be initialized in main.py and passed here
dna_service = DNAService()
ghost_registry = GhostRegistry(dna_service)

@router.post("/ingest")
async def ingest_events(events: List[Event], background_tasks: BackgroundTasks):
    try:
        for event in events:
            # 1. Identity identification
            service_id = event.service or event.target
            
            # 2. Update DNA
            if service_id:
                dna_service.update(service_id, event)
            
            # 3. Detect Renames (Ghost Protocol)
            if event.kind == "topology" and event.change == "rename":
                background_tasks.add_task(
                    ghost_registry.run_ghost_protocol, 
                    event.from_service, 
                    event.to_service
                )
        
        return {"status": "ingested", "count": len(events)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
