'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, MapPin, Wifi, Battery, ChevronRight,
  FileText, AlertTriangle, CheckCircle, Wrench, Radio,
  X, Volume2, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { queryAgent } from '../../lib/api';

// ── Pre-baked demo scenarios (fallback only) ──────────────────────────────────
const scenarios = [
  {
    query: 'Show wiring diagram compressor motor drive...',
    response: {
      title: 'Motor Drive Wiring — Compressor St. 2',
      source: 'Siemens S7-1200 Manual, §4.2',
      confidence: 97,
      type: 'WIRING DIAGRAM',
      typeColor: '#3b82f6',
      content: [
        'Terminal L1/L2/L3 → Main contactor K1 (400V AC)',
        'PE terminal → cabinet earthing bar (green/yellow)',
        'Control circuit: 24V DC from SMPS PSU-01',
        'Drive enable → PLC output Q0.4 via relay R12',
        'Fault reset signal → terminal X1:21',
      ],
      actions: ['VIEW FULL DIAGRAM', 'RAISE WORK ORDER', 'CALL SUPERVISOR'],
    },
  },
  {
    query: 'Lockout procedure for feedstock pump P-103...',
    response: {
      title: 'LOTO Procedure: P-103 Feedstock Pump',
      source: 'Safety Procedure SP-LOTO-042, Rev. 3',
      confidence: 99,
      type: 'SAFETY PROCEDURE',
      typeColor: '#f59e0b',
      content: [
        'Step 1 — Notify control room & get PTW #current',
        'Step 2 — Close suction valve V-201 (5 turns CW)',
        'Step 3 — Isolate on MCC-B Panel, breaker 14',
        'Step 4 — Apply personal padlock + red lockout tag',
        'Step 5 — Bleed pressure via drain point DP-42',
        'Step 6 — Verify zero energy (LOTO test button)',
        'Step 7 — Obtain shift supervisor countersign',
      ],
      actions: ['CONFIRM STEPS DONE', 'LOG LOTO EVENT', 'CALL CONTROL ROOM'],
    },
  },
  {
    query: 'Last inspection record for PSV-88 valve...',
    response: {
      title: 'Inspection Record: PSV-88 (Steam Gen.)',
      source: 'Maintenance Log ML-2024-0318',
      confidence: 94,
      type: 'INSPECTION RECORD',
      typeColor: '#10b981',
      content: [
        'Last calibrated: 14-Mar-2024 (212 days ago)',
        'Set pressure: 18.5 bar  |  Tolerance: ±0.2 bar',
        'Inspector: Singh, R. — Badge #4402',
        '⚠ STATUS: OVERDUE — Recalibration due every 6 months',
        'Next due: 14-Sep-2024 (8 days overdue!)',
      ],
      actions: ['SCHEDULE INSPECTION', 'FLAG TO COMPLIANCE', 'VIEW HISTORY'],
    },
  },
];

// ── Audio wave bar ────────────────────────────────────────────────────────────
function AudioWave({ active }) {
  const bars = [0.4, 0.7, 1.0, 0.8, 0.6, 0.9, 0.5, 0.75, 1.0, 0.6, 0.85, 0.4, 0.7, 0.9, 0.5];
  return (
    <div className="flex items-center justify-center gap-[3px] h-10">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full bg-green-400"
          style={{
            height: active ? `${h * 40}px` : '4px',
            transition: active ? 'none' : 'height 0.3s ease',
            animation: active ? `waveBounce ${0.4 + (i % 5) * 0.08}s ease-in-out infinite alternate` : 'none',
            opacity: active ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

// ── Status bar ────────────────────────────────────────────────────────────────
function StatusBar({ zone }) {
  const [time, setTime] = useState('');
  const [battery, setBattery] = useState(84);
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // Slowly drain battery to make it feel real (1% every 3 minutes of wall time)
  useEffect(() => {
    const id = setInterval(() => {
      setBattery(prev => Math.max(prev - 1, 5));
    }, 180000);
    return () => clearInterval(id);
  }, []);

  const batteryColor = battery < 20 ? 'text-red-400' : 'text-green-500';

  return (
    <div className="flex items-center justify-between px-5 py-2 bg-black/60 border-b border-green-900/50 text-green-500 text-[11px] font-mono">
      <div className="flex items-center gap-4">
        <span className="font-bold text-green-400">{time}</span>
        <div className="flex items-center gap-1.5" title="Simulated zone — no GPS active">
          <MapPin size={10} />
          <span>{zone} <span className="opacity-50">(DEMO)</span></span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1" title="Simulated — no real network connection">
          <Radio size={10} className="animate-pulse" />
          <span>PLANT NETWORK</span>
        </div>
        <div className={`flex items-center gap-1 ${batteryColor}`} title="Simulated battery level">
          <Battery size={10} />
          <span>{battery}%</span>
        </div>
      </div>
    </div>
  );
}

// ── Corner bracket decoration ─────────────────────────────────────────────────
function CornerBrackets({ children, color = 'border-green-500' }) {
  const size = 'w-3 h-3';
  return (
    <div className="relative">
      <div className={`absolute top-0 left-0 ${size} border-t-2 border-l-2 ${color}`} />
      <div className={`absolute top-0 right-0 ${size} border-t-2 border-r-2 ${color}`} />
      <div className={`absolute bottom-0 left-0 ${size} border-b-2 border-l-2 ${color}`} />
      <div className={`absolute bottom-0 right-0 ${size} border-b-2 border-r-2 ${color}`} />
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FieldModePage() {
  const [state, setState]             = useState('idle');   // idle | listening | processing | result
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [typedQuery, setTypedQuery]   = useState('');
  const [displayedSteps, setDisplayedSteps] = useState([]);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [liveResponse, setLiveResponse] = useState(null); // Real API response
  const zone = 'ZONE B — COMPRESSION UNIT';
  const timerRef    = useRef(null);
  const typeRef     = useRef(null);
  const recognizerRef = useRef(null);

  // Detect Web Speech API support on mount
  useEffect(() => {
    setSpeechSupported(typeof window !== 'undefined' && !!window.SpeechRecognition || !!(window?.webkitSpeechRecognition));
  }, []);

  const currentScenario = scenarios[scenarioIdx];

  // ── Shared: typewriter + show result ────────────────────────────────────────
  const runDemoFlow = async (query, isReal = false) => {
    setState('processing');
    let idx = 0;
    setTypedQuery('');
    typeRef.current = setInterval(() => {
      setTypedQuery(query.slice(0, idx + 1));
      idx++;
      if (idx >= query.length) {
        clearInterval(typeRef.current);
      }
    }, 40);

    if (isReal) {
      try {
        const res = await queryAgent(query, 'COPILOT', 'field-session');
        clearInterval(typeRef.current);
        setTypedQuery(query);
        
        // Parse the Markdown string roughly into lines/steps for the UI
        const lines = res.response.split('\n').filter(l => l.trim().length > 0);
        
        setLiveResponse({
          title: `Response from ${res.agent}`,
          source: 'Live AI Analysis',
          confidence: 95,
          type: 'FIELD ASSISTANT',
          typeColor: '#3b82f6',
          content: lines.slice(0, 7), // Just take first few lines to act as steps
          actions: ['VIEW FULL DETAILS', 'RAISE WORK ORDER'],
        });
        
        setDisplayedSteps([]);
        setState('result');
      } catch (err) {
        console.error(err);
        clearInterval(typeRef.current);
        // Fall back to demo
        setLiveResponse(null);
        setDisplayedSteps([]);
        setState('result');
      }
    } else {
      // Demo mode
      setLiveResponse(null);
      let waitTimer = setInterval(() => {
        if (idx >= query.length) {
          clearInterval(waitTimer);
          setTimeout(() => {
            setDisplayedSteps([]);
            setState('result');
          }, 600);
        }
      }, 100);
    }
  };

  const handlePressStart = () => {
    if (state !== 'idle') return;
    setState('listening');

    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (SpeechRecognition) {
      // ── Real Web Speech API path ─────────────────────────────────────────
      const recognition = new SpeechRecognition();
      recognizerRef.current = recognition;
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        runDemoFlow(transcript, true);
      };

      recognition.onerror = () => {
        // Fallback to demo on error
        runDemoFlow(currentScenario.query);
      };

      recognition.onend = () => {
        // If still listening (no result fired), fall back
        if (state === 'listening') runDemoFlow(currentScenario.query);
      };

      recognition.start();
      // Safety timeout: if speech API hangs, fall back after 8s
      timerRef.current = setTimeout(() => {
        try { recognition.stop(); } catch (_) {}
        runDemoFlow(currentScenario.query, false);
      }, 8000);
    } else {
      // ── Demo fallback (no Speech API) ────────────────────────────────────
      timerRef.current = setTimeout(() => {
        runDemoFlow(currentScenario.query);
      }, 2500);
    }
  };

  const handleReset = () => {
    clearTimeout(timerRef.current);
    clearInterval(typeRef.current);
    try { recognizerRef.current?.stop(); } catch (_) {}
    setState('idle');
    setTypedQuery('');
    setDisplayedSteps([]);
    // Advance to next scenario
    setScenarioIdx(i => (i + 1) % scenarios.length);
  };

  // Stagger the result steps appearing
  useEffect(() => {
    if (state !== 'result') return;
    const resp = liveResponse || currentScenario.response;
    const steps = resp.content;
    let i = 0;
    const id = setInterval(() => {
      setDisplayedSteps(prev => [...prev, steps[i]]);
      i++;
      if (i >= steps.length) clearInterval(id);
    }, 150);
    return () => clearInterval(id);
  }, [state]);

  const resp = liveResponse || currentScenario.response;

  return (
    <div
      className="w-full h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden relative select-none"
      style={{ backgroundColor: '#020c04', fontFamily: '"JetBrains Mono", monospace' }}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none z-50"
           style={{
             backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,255,80,0.015) 0px, rgba(0,255,80,0.015) 1px, transparent 1px, transparent 3px)',
           }} />

      {/* Status bar */}
      <StatusBar zone={zone} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-green-900/30">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-green-600 hover:text-green-400 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <p className="text-[10px] text-green-600 uppercase tracking-widest">IntelliPlant Field Mode</p>
            <p className="text-xl font-bold text-green-300 leading-tight">FIELD TECHNICIAN VIEW</p>
          </div>
        </div>
        <div className="px-3 py-1.5 bg-green-950/40 border border-green-800/50 text-green-400 text-[10px] uppercase tracking-widest" title="Simulated for demo">
          ● AI-ASSIST ONLINE
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-between p-5 overflow-hidden">

        {/* ── IDLE STATE ── */}
        {state === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full max-w-lg">
            <CornerBrackets>
              <div className="text-center px-6 py-4">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <MapPin size={16} className="text-green-500" />
                  <span className="text-green-400 text-sm uppercase tracking-widest">{zone}</span>
                </div>
                <p className="text-4xl font-bold text-white mb-2 leading-tight">AWAITING<br />COMMAND</p>
                <p className="text-green-600 text-xs uppercase tracking-widest">Tap & hold the button to speak</p>
              </div>
            </CornerBrackets>

            {/* Quick access cards */}
            <div className="w-full grid grid-cols-2 gap-3">
              {[
                { label: 'Wiring Diagrams', icon: FileText, color: 'border-blue-700 bg-blue-950/30 text-blue-400' },
                { label: 'Safety Procedures', icon: AlertTriangle, color: 'border-yellow-700 bg-yellow-950/30 text-yellow-400' },
                { label: 'Inspection Logs', icon: CheckCircle, color: 'border-green-700 bg-green-950/30 text-green-400' },
                { label: 'Work Orders', icon: Wrench, color: 'border-red-700 bg-red-950/30 text-red-400' },
              ].map(({ label, icon: Icon, color }) => (
                <button key={label}
                  onClick={() => alert(`Simulated: Opening ${label}`)}
                  className={`flex items-center gap-3 p-4 border rounded-none text-left ${color} hover:opacity-80 active:scale-95 transition-all`}>
                  <Icon size={22} />
                  <span className="text-xs font-bold uppercase leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── LISTENING STATE ── */}
        {state === 'listening' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-10 w-full">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full border-2 border-green-500 flex items-center justify-center mb-6 relative"
                   style={{ boxShadow: '0 0 40px rgba(74,222,128,0.3), 0 0 80px rgba(74,222,128,0.1)' }}>
                <Mic size={40} className="text-green-400" />
                <div className="absolute inset-0 rounded-full border border-green-500 animate-ping opacity-30" />
              </div>
              <p className="text-green-400 text-2xl font-bold uppercase tracking-widest">LISTENING...</p>
              <p className="text-green-700 text-xs mt-2 uppercase tracking-wider">Speak clearly into your mic</p>
            </div>
            <div className="w-full max-w-xs">
              <AudioWave active={true} />
            </div>
          </div>
        )}

        {/* ── PROCESSING STATE ── */}
        {state === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full">
            <div className="w-full max-w-lg">
              <CornerBrackets color="border-green-700">
                <p className="text-[10px] text-green-600 uppercase tracking-widest mb-3">Voice Query Captured</p>
                <p className="text-lg text-green-300 font-bold leading-relaxed min-h-[3rem]">
                  "{typedQuery}<span className="animate-pulse">▋</span>"
                </p>
              </CornerBrackets>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-green-500"
                       style={{ animation: `dotPulse 1s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <p className="text-green-600 text-xs uppercase tracking-widest">Querying Knowledge Graph...</p>
            </div>
          </div>
        )}

        {/* ── RESULT STATE ── */}
        {state === 'result' && (
          <div className="flex-1 flex flex-col w-full max-w-2xl gap-4 overflow-y-auto custom-scroll">
            {/* Source & Confidence */}
            <div className="flex items-center justify-between flex-shrink-0">
              <span className="text-[10px] uppercase tracking-widest px-2 py-1 font-bold"
                    style={{ color: resp.typeColor, backgroundColor: `${resp.typeColor}22`, border: `1px solid ${resp.typeColor}55` }}>
                {resp.type}
              </span>
              <span className="text-[10px] text-green-500 uppercase tracking-widest">{resp.confidence}% MATCH · {resp.source}</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white leading-tight flex-shrink-0">{resp.title}</h2>

            {/* Steps */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              {displayedSteps.map((step, i) => (
                <div key={i}
                     className="flex items-start gap-3 p-3 border border-green-900/50 bg-green-950/20 animate-[fadeSlideIn_0.3s_ease]">
                  <span className="text-green-500 font-bold text-xs mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <p className="text-sm text-green-200 leading-snug">{step}</p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            {displayedSteps.length === resp.content.length && (
              <div className="flex flex-col gap-2 mt-2 flex-shrink-0">
                {resp.actions.map((action, i) => (
                  <button key={action}
                    onClick={() => alert(`Simulated action triggered: ${action}`)}
                    className={`w-full py-4 text-sm font-bold uppercase tracking-widest transition-all active:scale-95 ${
                      i === 0
                        ? 'bg-green-600 hover:bg-green-500 text-black'
                        : 'border border-green-800 hover:bg-green-950/40 text-green-400'
                    }`}>
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PTT Button (always visible at bottom) ── */}
        <div className="flex flex-col items-center gap-3 w-full flex-shrink-0 mt-4">
          {state === 'result' && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-2 border border-green-800 text-green-500 hover:bg-green-950/40 text-xs uppercase tracking-widest transition-all mb-2"
            >
              <X size={14} /> New Query
            </button>
          )}
          <button
            onMouseDown={handlePressStart}
            onTouchStart={handlePressStart}
            disabled={state === 'processing' || state === 'listening'}
            className={`w-full max-w-xs py-6 rounded-none font-bold text-lg uppercase tracking-widest transition-all duration-150 select-none
              ${state === 'idle' || state === 'result'
                ? 'bg-green-600 text-black hover:bg-green-500 active:scale-95 active:bg-green-400 shadow-[0_0_30px_rgba(74,222,128,0.25)]'
                : state === 'listening'
                ? 'bg-green-400 text-black shadow-[0_0_50px_rgba(74,222,128,0.5)] scale-95'
                : 'bg-green-900/40 text-green-700 cursor-not-allowed border border-green-900'
              }`}
          >
            {state === 'idle' || state === 'result' ? (
              <span className="flex items-center justify-center gap-3">
                <Mic size={24} />
                HOLD TO SPEAK
              </span>
            ) : state === 'listening' ? (
              <span className="flex items-center justify-center gap-3">
                <Volume2 size={24} className="animate-pulse" />
                LISTENING...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                PROCESSING...
              </span>
            )}
          </button>
          <p className="text-[10px] text-green-800 uppercase tracking-widest text-center">
            {state === 'idle'
              ? speechSupported
                ? `Voice-enabled — Speak after pressing (Demo ${scenarioIdx + 1}/${scenarios.length})`
                : `Demo mode — Tap button to activate (${scenarioIdx + 1}/${scenarios.length})`
              : ''}
          </p>
        </div>
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes waveBounce {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1.0); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 1.0; transform: scale(1.2); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
