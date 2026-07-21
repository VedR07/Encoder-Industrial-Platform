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
    const fontSize = 12 / globalScale;
    const isHovered = hoverNode && hoverNode.id === node.id;
    const isNeighbor = hoverNode && neighbors.get(hoverNode.id).has(node.id);
    const isMuted = hoverNode && !isHovered && !isNeighbor;

    // Node radius
    const r = (node.val || 5) * 1.5;

    ctx.beginPath();
    
    // Determine shape based on group
    const group = node.group || '';
    if (group === 'Hardware' || group === 'Brand') {
      // Square
      ctx.rect(node.x - r, node.y - r, r * 2, r * 2);
    } else if (group === 'Fault' || group === 'RiskRule' || group === 'Document') {
      // Triangle
      ctx.moveTo(node.x, node.y - r);
      ctx.lineTo(node.x + r, node.y + r);
      ctx.lineTo(node.x - r, node.y + r);
      ctx.closePath();
    } else {
      // Circle
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    }
    
    // Solid fill
    ctx.fillStyle = isMuted ? '#cbd5e1' : (node.color || '#3b82f6');
    
    // Add glow effect if hovered
    if (isHovered) {
      ctx.shadowColor = node.color || '#3b82f6';
      ctx.shadowBlur = 10;
    } else {
      ctx.shadowBlur = 0;
    }
    
    ctx.fill();

    // Draw dark stroke around shape
    ctx.lineWidth = isHovered ? 2 / globalScale : 1 / globalScale;
    ctx.strokeStyle = isMuted ? '#e2e8f0' : '#475569';
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw Label below the node
    if (!isMuted || globalScale > 1.5) { // Only draw labels if not muted, or zoomed in
      ctx.font = `bold ${fontSize}px "Inter", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isMuted ? '#94a3b8' : '#1e293b'; // Dark text for light background
      
      // Draw white stroke behind text for readability
      ctx.lineWidth = 2 / globalScale;
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.strokeText(label, node.x, node.y + r + 4);
      ctx.fillText(label, node.x, node.y + r + 4);
    }
  }, [hoverNode, neighbors]);

  return (
    <div ref={containerRef} className="w-full h-full bg-white relative overflow-hidden">
      
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeRelSize={6}
        nodeLabel={() => ''} 
        linkColor={link => {
          const source = typeof link.source === 'object' ? link.source.id : link.source;
          const target = typeof link.target === 'object' ? link.target.id : link.target;
          
          if (!hoverNode) {
             // Assign some basic colors based on link label if we wanted to match the colorful edges, but gray is safer
             return 'rgba(203, 213, 225, 0.8)'; // slate-300
          }
          
          if (source === hoverNode.id || target === hoverNode.id) {
            return 'rgba(15, 23, 42, 0.6)'; // Dark line for connected
          }
          return 'rgba(241, 245, 249, 0.5)'; // Very light slate-100 for muted
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
