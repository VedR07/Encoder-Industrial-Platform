'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function OntologyGraph({ data, onNodeClick }) {
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef();

  const [hoverNode, setHoverNode] = useState(null);

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
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-400);
      fgRef.current.d3Force('link').distance(70);
      setTimeout(() => fgRef.current.zoomToFit(400, 50), 500);
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
    // Removed manual cursor override which was hiding the mouse
  }, []);

  const paintNode = useCallback((node, ctx, globalScale) => {
    const label = node.id;
    const fontSize = 11 / globalScale;
    const isHovered = hoverNode && hoverNode.id === node.id;
    const isNeighbor = hoverNode && neighbors.get(hoverNode.id).has(node.id);
    const isMuted = hoverNode && !isHovered && !isNeighbor;

    const r = (node.val || 5) * 1.5;

    ctx.beginPath();
    
    // Determine shape based on group
    const group = node.group || '';
    if (group === 'Hardware' || group === 'Fault') {
      // Rounded Square (like red/black nodes in screenshot)
      const size = r * 2;
      const x = node.x - r;
      const y = node.y - r;
      const radius = r * 0.4;
      if (ctx.roundRect) {
        ctx.roundRect(x, y, size, size, radius);
      } else {
        ctx.rect(x, y, size, size);
      }
    } else if (group === 'Software' || group === 'RiskRule') {
      // Triangle (like purple nodes in screenshot)
      ctx.moveTo(node.x, node.y - (r * 1.2));
      ctx.lineTo(node.x + r * 1.2, node.y + (r * 0.8));
      ctx.lineTo(node.x - r * 1.2, node.y + (r * 0.8));
      ctx.closePath();
    } else {
      // Circle (like blue/green nodes in screenshot)
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    }
    
    // Fill and Stroke
    ctx.fillStyle = isMuted ? '#e2e8f0' : (node.color || '#3b82f6');
    ctx.fill();
    ctx.lineWidth = isHovered ? 2 / globalScale : 1.5 / globalScale;
    ctx.strokeStyle = isMuted ? '#cbd5e1' : '#1e293b'; // Dark solid stroke
    ctx.stroke();

    // Add green badge to some nodes (like screenshot)
    if (!isMuted && node.id.length % 3 === 0) {
      const badgeR = r * 0.45;
      ctx.beginPath();
      ctx.arc(node.x + r * 0.8, node.y - r * 0.8, badgeR, 0, 2 * Math.PI);
      ctx.fillStyle = '#22c55e'; // Green badge
      ctx.fill();
      ctx.lineWidth = 1 / globalScale;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
      
      // Badge text
      ctx.font = `bold ${badgeR * 1.2}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText((node.id.length % 3) + 1, node.x + r * 0.8, node.y - r * 0.8);
    }

    // Draw Label below node (Plain dark text, no stroke, like screenshot)
    if (!isMuted || globalScale > 1.5) {
      ctx.font = `bold ${fontSize}px "Inter", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isMuted ? '#94a3b8' : '#0f172a';
      ctx.fillText(label, node.x, node.y + r + 3);
    }
  }, [hoverNode, neighbors]);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#f8fafc] relative overflow-hidden">
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
          
          if (hoverNode && source !== hoverNode.id && target !== hoverNode.id) {
            return 'rgba(226, 232, 240, 0.4)'; // slate-200 very muted
          }
          
          // Color edges based on target id length to simulate screenshot colors
          const len = target.length;
          if (len % 3 === 0) return 'rgba(249, 115, 22, 0.6)'; // orange
          if (len % 3 === 1) return 'rgba(34, 197, 94, 0.6)';  // green
          return 'rgba(56, 189, 248, 0.6)'; // light blue
        }}
        linkWidth={link => {
          const source = typeof link.source === 'object' ? link.source.id : link.source;
          const target = typeof link.target === 'object' ? link.target.id : link.target;
          return hoverNode && (source === hoverNode.id || target === hoverNode.id) ? 2 : 1;
        }}
        nodeCanvasObject={paintNode}
        onNodeClick={onNodeClick}
        onNodeHover={handleNodeHover}
        d3VelocityDecay={0.2}
        warmupTicks={50}
        cooldownTicks={0}
      />
    </div>
  );
}
