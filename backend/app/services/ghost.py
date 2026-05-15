from typing import Dict, Optional
from .dna import DNAService

class GhostRegistry:
    def __init__(self, dna_service: DNAService, graph_engine=None):
        self.dna_service = dna_service
        self.graph_engine = graph_engine  # injected to migrate edges
        # Maps new_service_id -> old_service_id
        self.lineage: Dict[str, str] = {}
        # Stores full mapping info
        self.mappings: Dict[str, Dict] = {}

    def run_ghost_protocol(self, old_id: str, new_id: str) -> bool:
        """
        Detects behavioral identity between old_id and new_id.
        If DNA similarity > 0.85, marks them as behavioral twins and
        migrates all graph edges from old to new.

        Returns True if Ghost Protocol was activated.
        """
        similarity = self.dna_service.get_similarity(old_id, new_id)

        # If behavior is > 85% identical, it's a Ghost match
        # Note: if one of the services has no DNA yet (new service),
        # we still register the lineage based on the rename event.
        if similarity > 0.85 or (similarity == 0.0 and old_id and new_id):
            confirmed = similarity > 0.85
            self.lineage[new_id] = old_id
            self.mappings[new_id] = {
                "old_id": old_id,
                "new_id": new_id,
                "similarity": round(similarity, 4),
                "status": "ghost_confirmed" if confirmed else "ghost_provisional",
            }

            # Migrate causal graph edges
            if self.graph_engine:
                self.graph_engine.migrate_edges(old_id, new_id)

            return True
        return False

    def get_ancestor(self, service_id: str) -> Optional[str]:
        """Returns the original identity of service_id if it was renamed."""
        return self.lineage.get(service_id)

    def get_full_lineage(self, service_id: str) -> list:
        """Returns the full ancestor chain: [service_id, parent, grandparent, ...]"""
        chain = [service_id]
        current = service_id
        visited = set()
        while current in self.lineage:
            ancestor = self.lineage[current]
            if ancestor in visited:
                break
            visited.add(ancestor)
            chain.append(ancestor)
            current = ancestor
        return chain
