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
      // Increase repulsion and link distance to prevent label overlap
      fgRef.current.d3Force('charge').strength(-500);
      fgRef.current.d3Force('link').distance(120);
      
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
    // Removed manual cursor override which was hiding the mouse
  }, []);

  const paintNode = useCallback((node, ctx, globalScale) => {
    const label = node.id;
    const fontSize = 14 / globalScale;
    const isHovered = hoverNode && hoverNode.id === node.id;
    const isNeighbor = hoverNode && neighbors.get(hoverNode.id).has(node.id);
    const isMuted = hoverNode && !isHovered && !isNeighbor;

    const r = (node.val || 5) * 1.5;

    // Add glow effect if hovered
    if (isHovered) {
      ctx.shadowColor = node.color;
      ctx.shadowBlur = 15;
    } else {
      ctx.shadowBlur = 0;
    }
    
    // Solid fill color
    ctx.fillStyle = isMuted ? '#334155' : (node.color || '#3b82f6');
    
    ctx.beginPath();
    
    if (node.group === 'Document') {
      // Draw a file/document shape
      const w = r * 1.5;
      const h = r * 2;
      const fold = w * 0.35;
      
      ctx.moveTo(node.x - w/2, node.y - h/2); // top-left
      ctx.lineTo(node.x + w/2 - fold, node.y - h/2); // top edge to fold
      ctx.lineTo(node.x + w/2, node.y - h/2 + fold); // fold corner
      ctx.lineTo(node.x + w/2, node.y + h/2); // right edge
      ctx.lineTo(node.x - w/2, node.y + h/2); // bottom edge
      ctx.closePath();
      
      ctx.fill();
      
      // Draw stroke
      ctx.lineWidth = isHovered ? 3 / globalScale : 1.5 / globalScale;
      ctx.strokeStyle = isMuted ? '#475569' : '#ffffff';
      ctx.stroke();
      
      // Draw the folded corner line
      ctx.beginPath();
      ctx.moveTo(node.x + w/2 - fold, node.y - h/2);
      ctx.lineTo(node.x + w/2 - fold, node.y - h/2 + fold);
      ctx.lineTo(node.x + w/2, node.y - h/2 + fold);
      ctx.stroke();
      
      // Add text lines for document aesthetics
      ctx.beginPath();
      ctx.moveTo(node.x - w/2 + fold/2, node.y - h/4);
      ctx.lineTo(node.x + w/4, node.y - h/4);
      ctx.moveTo(node.x - w/2 + fold/2, node.y);
      ctx.lineTo(node.x + w/2 - fold/2, node.y);
      ctx.moveTo(node.x - w/2 + fold/2, node.y + h/4);
      ctx.lineTo(node.x + w/2 - fold/2, node.y + h/4);
      ctx.lineWidth = 1 / globalScale;
      ctx.strokeStyle = isMuted ? '#1e293b' : 'rgba(255,255,255,0.7)';
      ctx.stroke();
      
    } else {
      // Draw standard Circle for everything else
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
      ctx.fill();
      
      // Draw white stroke around circle
      ctx.lineWidth = isHovered ? 3 / globalScale : 1.5 / globalScale;
      ctx.strokeStyle = isMuted ? '#475569' : '#ffffff';
      ctx.stroke();
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw Label below the node
    if (!isMuted || globalScale > 1.5) {
      ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isMuted ? '#64748b' : '#e2e8f0'; // Light text for dark background
      ctx.fillText(label, node.x, node.y + r + 4);
    }
  }, [hoverNode, neighbors]);

  const paintLink = useCallback((link, ctx, globalScale) => {
    const start = link.source;
    const end = link.target;
    if (typeof start !== 'object' || typeof end !== 'object') return; // wait for nodes to be initialized

    const isHovered = hoverNode && (start.id === hoverNode.id || end.id === hoverNode.id);
    if (!isHovered && globalScale < 1.5) return; // Only show labels on hover or zoom

    const label = link.label;
    if (!label) return;

    const fontSize = 10 / globalScale;
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
    
    // Calculate center of the link
    const textPos = Object.assign(...['x', 'y'].map(c => ({
      [c]: start[c] + (end[c] - start[c]) / 2
    })));

    ctx.save();
    ctx.translate(textPos.x, textPos.y);

    // Calculate angle for text rotation
    let angle = Math.atan2(end.y - start.y, end.x - start.x);
    // Keep text upright
    if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
      angle += Math.PI;
    }
    ctx.rotate(angle);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Background pill
    const padding = 4 / globalScale;
    const metrics = ctx.measureText(label);
    const bgWidth = metrics.width + padding * 2;
    const bgHeight = fontSize + padding * 2;
    
    ctx.fillStyle = isHovered ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.7)';
    ctx.beginPath();
    ctx.roundRect(-bgWidth/2, -bgHeight/2, bgWidth, bgHeight, 2/globalScale);
    ctx.fill();

    // Text
    ctx.fillStyle = isHovered ? '#38bdf8' : '#64748b'; // sky-400 when highlighted
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }, [hoverNode]);

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
        nodeLabel={() => ''} 
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
        linkCanvasObject={paintLink}
        linkCanvasObjectMode={() => 'after'}
        onNodeClick={onNodeClick}
        onNodeHover={handleNodeHover}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        cooldownTicks={0}
      />
    </div>
  );
}
