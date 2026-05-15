from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
import asyncio
from app.models.schema import Event
from app.services.dna import DNAService
from app.services.ghost import GhostRegistry
from app.api.routes.stream import manager

router = APIRouter()

# These will be initialized in main.py and passed here
dna_service = DNAService()
ghost_registry = GhostRegistry(dna_service)

# Shared instances
from app.api.routes.reconstruct import graph_engine

@router.post("/ingest")
async def ingest_events(events: List[Event], background_tasks: BackgroundTasks):
    from app.mongodb import mongo_db
    try:
        docs_to_insert = []
        for event in events:
            # Pydantic v2 .model_dump() or v1 .dict()
            ev_dict = event.model_dump() if hasattr(event, "model_dump") else event.dict()
            
            docs_to_insert.append(ev_dict)
            
            # 1. Identity identification
            service_id = ev_dict.get("service") or ev_dict.get("target")
            
            # 2. Update DNA
            if service_id:
                dna_service.update(service_id, ev_dict)
            
            # 3. Update Graph
            graph_engine.process_event(ev_dict)
            
            # 4. Detect Renames (Ghost Protocol)
            if ev_dict.get("kind") == "topology" and ev_dict.get("change") == "rename":
                from_svc = ev_dict.get("from") or ev_dict.get("from_service")
                to_svc = ev_dict.get("to") or ev_dict.get("to_service")
                if from_svc and to_svc:
                    background_tasks.add_task(
                        ghost_registry.run_ghost_protocol, 
                        from_svc, 
                        to_svc
                    )
                    
            # 5. Snapshot incidents
            if ev_dict.get("kind") == "incident_signal":
                inc_id = ev_dict.get("incident_id")
                if inc_id and service_id:
                    dna_service.store_incident(
                        incident_id=inc_id,
                        service_id=service_id,
                        metadata={"trigger": ev_dict.get("trigger", ""), "ts": ev_dict.get("ts", "")}
                    )
            
            # 6. Broadcast to UI
            await manager.broadcast(ev_dict)
            
        # 7. Persist to MongoDB asynchronously
        if mongo_db is not None and docs_to_insert:
            background_tasks.add_task(asyncio.to_thread, mongo_db.events.insert_many, docs_to_insert)
        
        return {"status": "ingested", "count": len(events)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
