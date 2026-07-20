'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ForceGraph2D to avoid SSR issues with canvas/window
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function OntologyGraph({ data, onNodeClick }) {
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef();

  // State for interactive hovering
  const [hoverNode, setHoverNode] = useState(null);

  // Precompute relationships for fast lookup during render
  const { nodesById, neighbors } = useMemo(() => {
    const nodesById = new Map();
    data.nodes.forEach(node => nodesById.set(node.id, node));

    const neighbors = new Map();
    data.nodes.forEach(node => neighbors.set(node.id, new Set()));

    data.links.forEach(link => {
      const source = typeof link.source === 'object' ? link.source.id : link.source;
      const target = typeof link.target === 'object' ? link.target.id : link.target;
      
      if (neighbors.has(source) && neighbors.has(target)) {
        neighbors.get(source).add(target);
        neighbors.get(target).add(source);
      }
    });

    return { nodesById, neighbors };
  }, [data]);

  useEffect(() => {
    // Zoom to fit on mount or data change
    if (fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 50);
      }, 500);
    }
  }, [data]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleNodeHover = useCallback((node) => {
    setHoverNode(node || null);
    // When hovering, cursor should be pointer
    if (containerRef.current) {
      containerRef.current.style.cursor = node ? 'pointer' : 'grab';
    }
  }, []);

  const paintNode = useCallback((node, ctx, globalScale) => {
    const label = node.id;
    const fontSize = 14 / globalScale;
    const isHovered = hoverNode && hoverNode.id === node.id;
    const isNeighbor = hoverNode && neighbors.get(hoverNode.id).has(node.id);
    const isMuted = hoverNode && !isHovered && !isNeighbor;

    // Node radius
    const r = (node.val || 5) * 1.5;

    // Draw Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    
    // Solid fill
    ctx.fillStyle = isMuted ? '#334155' : (node.color || '#3b82f6');
    
    // Add glow effect if hovered
    if (isHovered) {
      ctx.shadowColor = node.color;
      ctx.shadowBlur = 15;
    } else {
      ctx.shadowBlur = 0;
    }
    
    ctx.fill();

    // Draw white stroke around circle
    ctx.lineWidth = isHovered ? 3 / globalScale : 1.5 / globalScale;
    ctx.strokeStyle = isMuted ? '#475569' : '#ffffff';
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw Label below the node
    if (!isMuted || globalScale > 1.5) { // Only draw labels if not muted, or zoomed in
      ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isMuted ? '#64748b' : '#e2e8f0'; // Light text for dark background
      ctx.fillText(label, node.x, node.y + r + 4);
    }
  }, [hoverNode, neighbors]);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0f172a] relative overflow-hidden">
      {/* Background Grid Pattern for Cyberpunk aesthetic */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeRelSize={6}
        nodeLabel={() => ''} // Custom tooltip handled via canvas if needed, or disable default
        linkColor={link => {
          const source = typeof link.source === 'object' ? link.source.id : link.source;
          const target = typeof link.target === 'object' ? link.target.id : link.target;
          
          if (!hoverNode) return 'rgba(148, 163, 184, 0.4)'; // Default slate-400
          
          if (source === hoverNode.id || target === hoverNode.id) {
            return 'rgba(255, 255, 255, 0.8)'; // Highlight connected links
          }
          return 'rgba(51, 65, 85, 0.2)'; // Mute unrelated links
        }}
        linkWidth={link => {
          const source = typeof link.source === 'object' ? link.source.id : link.source;
          const target = typeof link.target === 'object' ? link.target.id : link.target;
          return hoverNode && (source === hoverNode.id || target === hoverNode.id) ? 3 : 1;
        }}
        linkDirectionalParticles={link => {
          const source = typeof link.source === 'object' ? link.source.id : link.source;
          const target = typeof link.target === 'object' ? link.target.id : link.target;
          return hoverNode && (source === hoverNode.id || target === hoverNode.id) ? 4 : 0;
        }}
        linkDirectionalParticleWidth={3}
        linkDirectionalParticleSpeed={0.005}
        nodeCanvasObject={paintNode}
        onNodeClick={onNodeClick}
        onNodeHover={handleNodeHover}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        cooldownTicks={0}
      />
    </div>
  );
}
