"use client";
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

type AdvancedGraphProps = {
  topChain: any[];
  oldService: string;
  currentService: string;
  hasGhost: boolean;
};

// Node group metadata for legend + coloring
const NODE_META: Record<string, { color: string; label: string; size: number }> = {
  root: { color: '#F97316', label: 'Root Cause', size: 14 },
  effect: { color: '#EF4444', label: 'Effect Node', size: 10 },
  ghost: { color: '#A78BFA', label: 'Historical Match (Ghost)', size: 10 },
  current: { color: '#FACC15', label: 'Current Service', size: 14 },
};

export default function AdvancedGraph({
  topChain,
  oldService,
  currentService,
  hasGhost,
}: AdvancedGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 380 });
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [ready, setReady] = useState(false);

  // Measure container — only once on mount + resize
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Build graph data — NO ambient noise nodes, only meaningful nodes
  const graphData = useMemo(() => {
    const nodesMap = new Map<string, any>();
    const links: any[] = [];

    const addNode = (id: string, group: string) => {
      if (!nodesMap.has(id)) {
        nodesMap.set(id, {
          id,
          group,
          val: NODE_META[group]?.size ?? 8,
        });
      }
    };

    // Determine root cause (first cause in chain that never appears as an effect)
    const effectIds = new Set(topChain.map((e) => e.effect_id));
    const rootIds = new Set(topChain.map((e) => e.cause_id).filter((id) => !effectIds.has(id)));

    // Core causal chain
    topChain.forEach((edge) => {
      const causeGroup = rootIds.has(edge.cause_id) ? 'root' : 'cause';
      const effectGroup = edge.effect_id === currentService ? 'current' : 'effect';

      addNode(edge.cause_id, causeGroup);
      addNode(edge.effect_id, effectGroup);

      links.push({
        source: edge.cause_id,
        target: edge.effect_id,
        label: `${Math.round((edge.confidence ?? 0) * 100)}%`,
        confidence: edge.confidence ?? 0,
        color: `hsl(${Math.round((1 - (edge.confidence ?? 0)) * 120)}, 90%, 55%)`,
        isCore: true,
      });
    });

    // Ensure currentService exists
    if (!nodesMap.has(currentService)) {
      addNode(currentService, 'current');
    }

    // Ghost node — historical pattern match, clearly labelled
    if (hasGhost && oldService && oldService !== 'unknown') {
      addNode(oldService, 'ghost');
      links.push({
        source: oldService,
        target: currentService,
        label: 'Historical Match',
        color: '#A78BFA',
        isGhost: true,
      });
    }

    return { nodes: Array.from(nodesMap.values()), links };
  }, [topChain, oldService, currentService, hasGhost]);

  // After engine stops: set forces + zoom to fit — NO auto-rotation that blocks user
  const handleEngineStop = useCallback(() => {
    if (!fgRef.current || ready) return;
    setReady(true);
    fgRef.current.zoomToFit(400, 80);
  }, [ready]);

  // Apply forces on mount or graphData change
  useEffect(() => {
    if (!fgRef.current) return;
    
    // Let user drag & orbit freely — do NOT override with setInterval
    const linkForce = fgRef.current.d3Force('link');
    if (linkForce) {
      linkForce.distance((link: any) =>
        link.isCore ? 160 : link.isGhost ? 220 : 80
      );
    }
    const chargeForce = fgRef.current.d3Force('charge');
    if (chargeForce) chargeForce.strength(-400);
  }, [graphData]);

  // Node color
  const nodeColor = useCallback((node: any) => {
    return NODE_META[node.group]?.color ?? '#60A5FA';
  }, []);

  // Link width — thicker = higher confidence
  const linkWidth = useCallback((link: any) => {
    if (link.isGhost) return 1;
    return 1 + (link.confidence ?? 0.5) * 3;
  }, []);

  // Particle count — more particles = higher confidence on causal links
  const particleCount = useCallback((link: any) => {
    if (link.isGhost) return 3;
    if (link.isCore) return Math.round((link.confidence ?? 0.5) * 6) + 1;
    return 0;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl overflow-hidden border border-gray-700/60 shadow-xl"
      style={{ height: '380px', background: '#080c14' }}
    >
      {/* ── Legend ── */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
        {Object.entries(NODE_META).map(([key, meta]) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: meta.color }}
            />
            <span className="text-[10px] font-mono tracking-wide" style={{ color: meta.color }}>
              {meta.label}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-block w-6 h-0.5" style={{ background: 'linear-gradient(to right, #10B981, #EF4444)' }} />
          <span className="text-[10px] font-mono text-gray-400">Link = Confidence</span>
        </div>
        {hasGhost && (
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 border-t border-dashed border-violet-400" />
            <span className="text-[10px] font-mono text-violet-400">Ghost link (dashed)</span>
          </div>
        )}
      </div>

      {/* ── Hovered node tooltip ── */}
      {hoveredNode && (
        <div className="absolute top-3 right-3 z-20 bg-gray-900/90 border border-gray-700 rounded-lg px-3 py-2 pointer-events-none">
          <p className="text-xs font-mono text-white">{hoveredNode.id}</p>
          <p className="text-[10px] font-mono" style={{ color: NODE_META[hoveredNode.group]?.color ?? '#fff' }}>
            {NODE_META[hoveredNode.group]?.label ?? hoveredNode.group}
          </p>
        </div>
      )}

      {/* ── Controls hint ── */}
      <div className="absolute bottom-2 right-3 z-20 pointer-events-none">
        <span className="text-[9px] font-mono text-gray-600">
          LEFT DRAG = ROTATE · SCROLL = ZOOM · RIGHT DRAG = PAN
        </span>
      </div>

      {/* ── Status dot ── */}
      <div className="absolute bottom-2 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
        <span className="text-[9px] font-mono text-red-400 tracking-widest">LIVE CAUSAL GRAPH</span>
      </div>

      {/* ── Force Graph ── */}
      {typeof window !== 'undefined' && (
        <ForceGraph3D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="#080c14"
          // Nodes
          nodeLabel="id"
          nodeColor={nodeColor}
          nodeRelSize={5}
          nodeOpacity={0.95}
          nodeResolution={24}
          // Links
          linkColor={(link: any) => link.color}
          linkWidth={linkWidth}
          linkOpacity={0.75}
          linkLabel={(link: any) => link.label ?? ''}
          // Particles — more particles = stronger causal signal
          linkDirectionalParticles={particleCount}
          linkDirectionalParticleWidth={(link: any) => (link.isCore ? 2.5 : 1.5)}
          linkDirectionalParticleColor={(link: any) => link.color}
          linkDirectionalParticleSpeed={(link: any) =>
            link.isGhost ? 0.025 : 0.008 + (link.confidence ?? 0.5) * 0.012
          }
          // Interaction — fully user-controlled, no auto-override
          enableNodeDrag={true}
          enableNavigationControls={true}
          showNavInfo={false}
          // Events
          onNodeHover={setHoveredNode}
          onEngineStop={handleEngineStop}
        />
      )}
    </div>
  );
}