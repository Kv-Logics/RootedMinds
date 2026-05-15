from typing import Iterable
from .adapter import Adapter # Assuming this exists in the bench-p02-context folder
from app.models.schema import Event, IncidentSignal, Context
from app.services.dna import DNAService
from app.services.graph import CausalGraphEngine
from app.services.ghost import GhostRegistry
from app.services.reconstruct import ReconstructService

class SentinelEngine(Adapter):
    def __init__(self):
        self.dna_service = DNAService()
        self.graph_engine = CausalGraphEngine()
        self.ghost_registry = GhostRegistry(self.dna_service)
        self.reconstruct_service = ReconstructService(
            self.dna_service, self.graph_engine, self.ghost_registry
        )

    def ingest(self, events: Iterable[Event]) -> None:
        for event in events:
            # 1. Update DNA
            service_id = event.get("service") or event.get("target")
            if service_id:
                self.dna_service.update(service_id, event)
            
            # 2. Update Graph
            self.graph_engine.process_event(event)
            
            # 3. Ghost Protocol
            if event.get("kind") == "topology" and event.get("change") == "rename":
                self.ghost_registry.run_ghost_protocol(event["from"], event["to"])

    def reconstruct_context(self, signal: IncidentSignal, mode: str = "fast") -> Context:
        return self.reconstruct_service.reconstruct(signal, mode=mode)

    def close(self):
        # Shutdown logic if needed
        pass
