'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, Maximize2, AlertOctagon, Activity, Thermometer, Gauge, Clock, ChevronLeft, ChevronRight, Play, Pause, RotateCcw
} from 'lucide-react';

export default function DigitalTwinPage() {
  const [timeScrub, setTimeScrub] = useState(100); // 100 = Now (Fault), 0 = 5 mins ago (Normal)
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNode, setActiveNode] = useState(null);

  // Auto-play the timeline
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeScrub(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Interpolate values based on time scrub
  // At t=0 (normal): Vib=2.1, Temp=78, RPM=1450
  // At t=100 (fault): Vib=7.8, Temp=92, RPM=1320
  
  const getInterpolatedValue = (start, end) => {
    const progress = timeScrub / 100;
    // Exponential curve for sudden failure simulation
    const easeInQuad = progress * progress;
    return (start + (end - start) * easeInQuad).toFixed(1);
  };

  const vibration = getInterpolatedValue(2.1, 7.8);
  const temperature = getInterpolatedValue(78, 92);
  const rpm = Math.round(getInterpolatedValue(1450, 1320));

  const isFaultState = timeScrub > 80;
  
  // Format time display (-5:00 to 0:00)
  const formatTime = () => {
    const secondsFromNow = Math.floor((100 - timeScrub) * 3); // 300 seconds total (5 mins)
    const mins = Math.floor(secondsFromNow / 60);
    const secs = secondsFromNow % 60;
    return `-${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] flex flex-col bg-slate-950 overflow-hidden text-slate-300 font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex-shrink-0 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-500/20 border border-blue-500/50 rounded-sm">
            <Box size={16} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
              Digital Twin: Compressor St. 2
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              Asset ID: EQ-77X-COMP | Plant: Refinery Alpha
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-slate-800/80 border border-slate-700 flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Model Fidelity</span>
            <span className="text-xs text-blue-400 font-mono">HIGH (99.8%)</span>
          </div>
          <button className="text-slate-400 hover:text-white transition-colors">
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      {/* Main 2.5D Schematic Area */}
      <div className="flex-1 relative flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(to right, #4f46e5 1px, transparent 1px), linear-gradient(to bottom, #4f46e5 1px, transparent 1px)', 
               backgroundSize: '40px 40px',
               transform: 'perspective(1000px) rotateX(60deg) scale(2.5) translateY(-20%)',
               transformOrigin: 'top center'
             }}>
        </div>

        {/* Central SVG Schematic (Highly Stylized) */}
        <div className="relative z-10 w-full max-w-4xl aspect-[21/9] flex items-center justify-center">
          
          {/* Main Body */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 bg-gradient-to-r from-slate-800 to-slate-700 border-2 border-slate-600 rounded-lg shadow-2xl flex items-center justify-between px-8"
               style={{ transform: 'perspective(800px) rotateX(20deg) rotateY(-15deg)' }}>
            
            {/* Intake */}
            <div className="w-16 h-24 bg-slate-900 border-l-4 border-blue-500 flex items-center justify-center shadow-inner">
              <div className="w-10 h-10 rounded-full border-4 border-slate-700 animate-[spin_4s_linear_infinite]" 
                   style={{ animationDuration: `${(rpm/1450)*4}s` }}>
                <div className="w-full h-1 bg-slate-600 top-1/2 absolute -translate-y-1/2"></div>
                <div className="w-1 h-full bg-slate-600 left-1/2 absolute -translate-x-1/2"></div>
              </div>
            </div>

            {/* Core Casing */}
            <div className="flex-1 mx-4 h-32 border-y-2 border-slate-600 relative overflow-hidden flex flex-col justify-evenly">
               <div className="h-2 w-full bg-slate-800/50"></div>
               <div className="h-2 w-full bg-slate-800/50"></div>
               <div className="h-2 w-full bg-slate-800/50"></div>
               <div className="h-2 w-full bg-slate-800/50"></div>
               
               {/* Fault Heatmap Overlay */}
               <div className="absolute inset-0 transition-opacity duration-300"
                    style={{ 
                      background: 'radial-gradient(circle at 70% 50%, rgba(239,68,68,0.4) 0%, transparent 60%)',
                      opacity: isFaultState ? (timeScrub / 100) : 0 
                    }}>
               </div>
            </div>

            {/* Exhaust / Drive Shaft (The Fault Point) */}
            <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center relative transition-colors duration-300 ${isFaultState ? 'bg-red-900/30 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-slate-800 border-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full transition-colors duration-300 ${isFaultState ? 'bg-red-500 animate-pulse' : 'bg-blue-400'}`}></div>
              
              {/* Fault Pulsing Ring */}
              {isFaultState && (
                <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-50"></div>
              )}
            </div>
            
          </div>

          {/* Floating Data Nodes */}
          
          {/* Node 1: Intake RPM */}
          <div className="absolute top-[10%] left-[20%] group">
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 p-3 shadow-lg flex items-center gap-3">
              <Gauge size={18} className="text-blue-400" />
              <div>
                <p className="text-[9px] font-mono uppercase text-slate-400">Drive RPM</p>
                <p className="text-lg font-bold text-white tracking-wider">{rpm} <span className="text-[10px] text-slate-500">RPM</span></p>
              </div>
            </div>
            <div className="w-16 h-px bg-slate-600 absolute top-1/2 -right-16 transform rotate-12"></div>
          </div>

          {/* Node 2: Casing Temp */}
          <div className="absolute top-[5%] left-[50%] -translate-x-1/2 group">
            <div className={`bg-slate-900/80 backdrop-blur-sm border p-3 shadow-lg flex items-center gap-3 transition-colors duration-300 ${isFaultState ? 'border-orange-500/50' : 'border-slate-700'}`}>
              <Thermometer size={18} className={isFaultState ? 'text-orange-400' : 'text-blue-400'} />
              <div>
                <p className="text-[9px] font-mono uppercase text-slate-400">Core Temp</p>
                <p className={`text-lg font-bold tracking-wider transition-colors duration-300 ${isFaultState ? 'text-orange-400' : 'text-white'}`}>
                  {temperature} <span className="text-[10px] text-slate-500">°C</span>
                </p>
              </div>
            </div>
            <div className="w-px h-16 bg-slate-600 absolute -bottom-16 left-1/2"></div>
          </div>

          {/* Node 3: Mechanical Seal Vibration (The Fault) */}
          <div className="absolute bottom-[15%] right-[15%] group">
            <div className={`bg-slate-900/80 backdrop-blur-sm border p-3 shadow-lg flex items-center gap-3 transition-all duration-300 ${isFaultState ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-slate-700'}`}>
              <Activity size={18} className={isFaultState ? 'text-red-500 animate-pulse' : 'text-blue-400'} />
              <div>
                <p className="text-[9px] font-mono uppercase text-slate-400">Seal Vibration</p>
                <p className={`text-lg font-bold tracking-wider transition-colors duration-300 ${isFaultState ? 'text-red-500' : 'text-white'}`}>
                  {vibration} <span className="text-[10px] text-slate-500">mm/s</span>
                </p>
              </div>
              {isFaultState && (
                <div className="ml-2 px-2 py-0.5 bg-red-950 border border-red-800 text-[9px] text-red-500 font-bold uppercase animate-pulse">
                  CRITICAL
                </div>
              )}
            </div>
            <div className="w-24 h-px bg-slate-600 absolute top-0 -left-24 transform -rotate-12"></div>
          </div>

        </div>

        {/* Diagnostic Panel Overlay */}
        <div className={`absolute top-6 right-6 w-80 bg-slate-900/90 backdrop-blur-md border transition-all duration-500 transform ${isFaultState ? 'border-red-500/50 translate-x-0 opacity-100' : 'border-slate-700 translate-x-10 opacity-0 pointer-events-none'}`}>
          <div className="p-3 border-b border-slate-800 flex items-center gap-2 bg-red-950/30">
            <AlertOctagon size={14} className="text-red-500" />
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest font-mono">Agent Diagnostics</h3>
          </div>
          <div className="p-4">
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              <span className="font-bold text-white">Root Cause Identified:</span> High-frequency vibration spike correlates with sudden mechanical seal degradation.
            </p>
            <div className="space-y-2">
              <button className="w-full py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors">
                EMERGENCY BYPASS
              </button>
              <button className="w-full py-2 border border-slate-600 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors">
                VIEW MAINTENANCE LOGS
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Time-Scrub Control Panel */}
      <div className="h-24 bg-slate-950 border-t border-slate-800 flex items-center px-8 gap-8 relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setTimeScrub(0)}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-700 hover:bg-slate-800 transition-colors text-slate-400"
          >
            <RotateCcw size={14} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 transition-colors text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
          </button>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-mono text-slate-500">T-5:00 (Normal Operation)</span>
            <span className="text-lg font-mono font-bold text-white bg-slate-900 px-3 py-1 border border-slate-700 rounded shadow-inner flex items-center gap-2">
              <Clock size={14} className="text-blue-500" />
              {timeScrub === 100 ? "NOW (FAULT)" : formatTime()}
            </span>
          </div>
          
          <div className="relative h-6 flex items-center group">
            {/* Danger Zone Indicator on Track */}
            <div className="absolute right-0 h-2 w-[20%] bg-gradient-to-r from-transparent to-red-900/50 rounded-r-full pointer-events-none"></div>
            
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={timeScrub}
              onChange={(e) => {
                setTimeScrub(Number(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer relative z-10 
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                         [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(37,99,235,0.8)]
                         [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                         group-hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
              style={{
                background: `linear-gradient(to right, #2563eb ${timeScrub}%, #1e293b ${timeScrub}%)`
              }}
            />
          </div>
        </div>

      </div>

    </div>
  );
}
