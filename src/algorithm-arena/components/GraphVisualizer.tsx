import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Share2, Compass, Network, MapPin } from 'lucide-react';
import { GraphEngine, GraphStep } from '../engine/graphs/GraphEngine';

export const GraphVisualizer: React.FC = () => {
  const [engine] = useState(() => new GraphEngine());
  const [history, setHistory] = useState<GraphStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'CANVAS' | 'MATRIX' | 'LIST'>('CANVAS');

  useEffect(() => {
    setHistory(engine.getHistory());
    setCurrentStepIdx(engine.getHistory().length - 1);
  }, [engine]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStepIdx < history.length - 1) {
      timer = setTimeout(() => {
        setCurrentStepIdx((prev) => prev + 1);
      }, 800);
    } else if (currentStepIdx >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, history.length]);

  const currentStep = history[currentStepIdx] || {
    vertices: [],
    edges: [],
    description: 'Ready',
  };

  const handleBFS = () => {
    const newHist = engine.runBFS('A');
    setHistory([...newHist]);
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  const handleDFS = () => {
    const newHist = engine.runDFS('A');
    setHistory([...newHist]);
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  const handleDijkstra = () => {
    const newHist = engine.runDijkstra('A');
    setHistory([...newHist]);
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white p-6 rounded-2xl overflow-hidden space-y-6">
      {/* Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/90 p-4 rounded-xl border border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-cyan-400">🌐 Graphs & Networks Lab</h2>
          <p className="text-xs text-slate-400">Vertices, Weighted Edges, BFS/DFS Traversal & Dijkstra Shortest Path</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Representation Selector */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('CANVAS')}
              className={`px-3 py-1 rounded transition ${viewMode === 'CANVAS' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              Canvas
            </button>
            <button
              onClick={() => setViewMode('MATRIX')}
              className={`px-3 py-1 rounded transition ${viewMode === 'MATRIX' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              Adj Matrix
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1 rounded transition ${viewMode === 'LIST' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              Adj List
            </button>
          </div>

          <button
            onClick={handleBFS}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>BFS</span>
          </button>
          <button
            onClick={handleDFS}
            className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>DFS</span>
          </button>
          <button
            onClick={handleDijkstra}
            className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Dijkstra Shortest Path</span>
          </button>
        </div>
      </div>

      {/* Graph Visualizer Display Area */}
      <div className="flex-1 bg-slate-950/80 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between relative overflow-auto">
        {/* Queue / Stack / Distance telemetry header */}
        <div className="flex flex-wrap gap-4 text-xs font-mono mb-4">
          {currentStep.queueState && (
            <div className="bg-slate-900 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-emerald-400">
              <span className="font-bold">BFS Queue: </span>[{currentStep.queueState.join(', ')}]
            </div>
          )}
          {currentStep.stackState && (
            <div className="bg-slate-900 border border-purple-500/30 px-3 py-1.5 rounded-lg text-purple-400">
              <span className="font-bold">DFS Call Stack: </span>[{currentStep.stackState.join(' ➔ ')}]
            </div>
          )}
          {currentStep.distanceTable && (
            <div className="bg-slate-900 border border-amber-500/30 px-3 py-1.5 rounded-lg text-amber-400 flex gap-3">
              <span className="font-bold">Dijkstra Distances:</span>
              {Object.entries(currentStep.distanceTable).map(([v, d]) => (
                <span key={v}>{v}: {d === Infinity ? '∞' : d}</span>
              ))}
            </div>
          )}
        </div>

        {/* VIEW 1: Interactive SVG Graph Canvas */}
        {viewMode === 'CANVAS' && (
          <div className="relative w-full h-80 bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
            <svg className="w-full h-full">
              {/* Edges */}
              {currentStep.edges.map((edge) => {
                const u = currentStep.vertices.find((v) => v.id === edge.from);
                const v = currentStep.vertices.find((v) => v.id === edge.to);
                if (!u || !v) return null;

                const isActive = currentStep.activeEdgeId === edge.id;

                return (
                  <g key={edge.id}>
                    <line
                      x1={u.x}
                      y1={u.y}
                      x2={v.x}
                      y2={v.y}
                      stroke={isActive ? '#fbbf24' : '#475569'}
                      strokeWidth={isActive ? 4 : 2}
                      strokeDasharray={isActive ? '4 4' : undefined}
                    />
                    <text
                      x={(u.x + v.x) / 2}
                      y={(u.y + v.y) / 2 - 6}
                      fill="#94a3b8"
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {edge.weight}
                    </text>
                  </g>
                );
              })}

              {/* Vertices */}
              {currentStep.vertices.map((vertex) => {
                const isCurrent = currentStep.currentVertexId === vertex.id;

                return (
                  <g key={vertex.id} transform={`translate(${vertex.x}, ${vertex.y})`}>
                    <circle
                      r={24}
                      className={`transition-all duration-300 cursor-pointer ${
                        isCurrent
                          ? 'fill-amber-400 stroke-amber-200 stroke-4 shadow-lg shadow-amber-400/50'
                          : 'fill-slate-800 stroke-slate-600 stroke-2 hover:fill-slate-700'
                      }`}
                    />
                    <text
                      textAnchor="middle"
                      dy="5"
                      fill={isCurrent ? '#090d16' : '#f8fafc'}
                      fontWeight="extrabold"
                      fontSize="14"
                      fontFamily="monospace"
                    >
                      {vertex.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* VIEW 2: Adjacency Matrix */}
        {viewMode === 'MATRIX' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 font-mono text-sm">
              <h3 className="text-cyan-400 font-bold mb-4 text-center">ADJACENCY MATRIX (Weight Representation)</h3>
              <table className="border-collapse text-center">
                <thead>
                  <tr>
                    <th className="p-2 border border-slate-700 text-amber-400"></th>
                    {currentStep.vertices.map((v) => (
                      <th key={v.id} className="p-3 border border-slate-700 text-amber-400 font-bold">{v.id}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentStep.vertices.map((rV) => (
                    <tr key={rV.id}>
                      <td className="p-3 border border-slate-700 text-amber-400 font-bold">{rV.id}</td>
                      {currentStep.vertices.map((cV) => {
                        const edge = currentStep.edges.find(
                          (e) => (e.from === rV.id && e.to === cV.id) || (e.from === cV.id && e.to === rV.id)
                        );
                        return (
                          <td key={cV.id} className={`p-3 border border-slate-800 ${edge ? 'text-emerald-400 font-bold bg-slate-800' : 'text-slate-600'}`}>
                            {rV.id === cV.id ? 0 : edge ? edge.weight : '∞'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: Adjacency List */}
        {viewMode === 'LIST' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 font-mono text-sm w-full max-w-xl space-y-3">
              <h3 className="text-cyan-400 font-bold mb-2">ADJACENCY LIST POINTER CHAINS</h3>
              {currentStep.vertices.map((v) => {
                const connectedEdges = currentStep.edges.filter((e) => e.from === v.id || e.to === v.id);
                return (
                  <div key={v.id} className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 font-bold flex items-center justify-center">{v.id}</span>
                    <span className="text-slate-500">➔</span>
                    <div className="flex items-center space-x-2 flex-wrap">
                      {connectedEdges.map((e) => {
                        const target = e.from === v.id ? e.to : e.from;
                        return (
                          <span key={e.id} className="bg-slate-800 border border-slate-700 text-amber-300 px-2.5 py-1 rounded-md text-xs">
                            [{target} | w:{e.weight}]
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Playback Footer Controls */}
        <div className="mt-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Step {currentStepIdx + 1} / {history.length}</span>
            <p className="text-sm font-mono text-slate-200">{currentStep.description}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setCurrentStepIdx(0);
                setIsPlaying(false);
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg flex items-center space-x-1.5 text-xs"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
              <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
