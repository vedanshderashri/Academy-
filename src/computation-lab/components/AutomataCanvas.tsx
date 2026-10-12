import React, { useRef, useEffect, useState } from 'react';
import { DFAState, DFATransition, SymbolChar } from '../core/types';
import { StateHitmenu } from './StateHitmenu';
import { Plus, Trash2, CheckCircle2, Play, Move, Zap, Flag, MousePointer } from 'lucide-react';

interface AutomataCanvasProps {
  states: DFAState[];
  transitions: DFATransition[];
  alphabet: SymbolChar[];
  activeStateId?: string | null;
  activeTransitionId?: string | null;
  onAddState: (x: number, y: number) => void;
  onUpdateState: (updated: DFAState) => void;
  onDeleteState: (stateId: string) => void;
  onAddTransition: (fromId: string, toId: string, symbol: SymbolChar) => void;
  onDeleteTransition: (transId: string) => void;
  onSelectState: (stateId: string | null) => void;
  selectedStateId: string | null;
}

export const AutomataCanvas: React.FC<AutomataCanvasProps> = ({
  states,
  transitions,
  alphabet,
  activeStateId,
  activeTransitionId,
  onAddState,
  onUpdateState,
  onDeleteState,
  onAddTransition,
  onDeleteTransition,
  onSelectState,
  selectedStateId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [transitionMode, setTransitionMode] = useState<boolean>(false);
  const [transitionStartId, setTransitionStartId] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolChar>(alphabet[0] || '0');
  const [draggingStateId, setDraggingStateId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas size sync
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 60FPS Canvas Render Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Grid
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Group transitions between same state pairs
      const transMap = new Map<string, DFATransition[]>();
      transitions.forEach((t) => {
        const key = `${t.fromStateId}->${t.toStateId}`;
        if (!transMap.has(key)) transMap.set(key, []);
        transMap.get(key)!.push(t);
      });

      // 1. Render Transitions (Arrows)
      transitions.forEach((trans) => {
        const fromState = states.find((s) => s.id === trans.fromStateId);
        const toState = states.find((s) => s.id === trans.toStateId);
        if (!fromState || !toState) return;

        const isCurrentActive = activeTransitionId === trans.id;
        ctx.strokeStyle = isCurrentActive ? '#0284c7' : '#64748b';
        ctx.fillStyle = isCurrentActive ? '#0284c7' : '#475569';
        ctx.lineWidth = isCurrentActive ? 3.5 : 2;

        // Self-loop transition
        if (fromState.id === toState.id) {
          ctx.beginPath();
          ctx.arc(fromState.x, fromState.y - 32, 22, 0.2 * Math.PI, 1.8 * Math.PI);
          ctx.stroke();

          // Loop symbol label
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(trans.symbol, fromState.x, fromState.y - 62);
          return;
        }

        // Direct / Curved Transition
        const angle = Math.atan2(toState.y - fromState.y, toState.x - fromState.x);
        const startX = fromState.x + 28 * Math.cos(angle);
        const startY = fromState.y + 28 * Math.sin(angle);
        const endX = toState.x - 28 * Math.cos(angle);
        const endY = toState.y - 28 * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arrowhead
        const headLen = 10;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        // Label
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(midX - 12, midY - 10, 24, 18);
        ctx.strokeStyle = '#cbd5e1';
        ctx.strokeRect(midX - 12, midY - 10, 24, 18);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(trans.symbol, midX, midY + 3);
      });

      // 2. Render States
      states.forEach((state) => {
        const isSelected = selectedStateId === state.id;
        const isActive = activeStateId === state.id;
        const isStart = state.isStart;
        const isAccepting = state.isAccepting;

        // Selection / Simulation Glow
        if (isSelected || isActive) {
          ctx.beginPath();
          ctx.arc(state.x, state.y, 35, 0, Math.PI * 2);
          ctx.fillStyle = isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(2, 132, 199, 0.2)';
          ctx.fill();
          ctx.strokeStyle = isActive ? '#10b981' : '#0284c7';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Start State Arrow
        if (isStart) {
          ctx.beginPath();
          ctx.moveTo(state.x - 50, state.y);
          ctx.lineTo(state.x - 28, state.y);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(state.x - 28, state.y);
          ctx.lineTo(state.x - 36, state.y - 6);
          ctx.lineTo(state.x - 36, state.y + 6);
          ctx.closePath();
          ctx.fillStyle = '#0f172a';
          ctx.fill();
        }

        // Outer Accepting Circle
        if (isAccepting) {
          ctx.beginPath();
          ctx.arc(state.x, state.y, 30, 0, Math.PI * 2);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // State Base Circle
        ctx.beginPath();
        ctx.arc(state.x, state.y, 25, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#dcfce7' : '#ffffff';
        ctx.fill();
        ctx.strokeStyle = isActive ? '#059669' : '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // State Name
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(state.name, state.x, state.y + 4);
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [states, transitions, selectedStateId, activeStateId, activeTransitionId]);

  // Pointer Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedState = states.find((s) => Math.hypot(s.x - x, s.y - y) <= 28);

    if (transitionMode) {
      if (clickedState) {
        if (!transitionStartId) {
          setTransitionStartId(clickedState.id);
        } else {
          onAddTransition(transitionStartId, clickedState.id, selectedSymbol);
          setTransitionStartId(null);
        }
      }
      return;
    }

    if (clickedState) {
      onSelectState(clickedState.id);
      setDraggingStateId(clickedState.id);
      setDragOffset({ x: x - clickedState.x, y: y - clickedState.y });
    } else {
      onSelectState(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingStateId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const targetState = states.find((s) => s.id === draggingStateId);
    if (targetState) {
      onUpdateState({
        ...targetState,
        x: Math.max(30, Math.min(canvasRef.current.width - 30, x - dragOffset.x)),
        y: Math.max(30, Math.min(canvasRef.current.height - 30, y - dragOffset.y)),
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingStateId(null);
  };

  const selectedState = states.find((s) => s.id === selectedStateId);

  return (
    <div className="relative w-full h-full bg-white flex flex-col font-sans select-none" ref={containerRef}>
      {/* Canvas Toolbar Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-2 rounded-xl shadow-xs">
        <button
          onClick={() => onAddState(150 + (states.length % 5) * 80, 150 + Math.floor(states.length / 5) * 80)}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add State</span>
        </button>

        <div className="flex items-center space-x-2 border-l border-slate-200 pl-2">
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-white border border-slate-300 text-xs font-bold rounded-lg px-2 py-1.5"
          >
            {alphabet.map((sym) => (
              <option key={sym} value={sym}>
                Symbol: {sym}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setTransitionMode(!transitionMode);
              setTransitionStartId(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              transitionMode
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{transitionMode ? (transitionStartId ? 'Click Destination State' : 'Click Source State') : 'Add Transition'}</span>
          </button>
        </div>
      </div>

      {/* Floating State Hitmenu Popover on State Click */}
      {selectedState && (
        <StateHitmenu
          state={selectedState}
          allStates={states}
          alphabet={alphabet}
          onUpdateState={onUpdateState}
          onDeleteState={(id) => {
            onDeleteState(id);
            onSelectState(null);
          }}
          onAddTransition={onAddTransition}
          onClose={() => onSelectState(null)}
        />
      )}

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-full cursor-crosshair"
      />
    </div>
  );
};

