import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, GitCommit, Layers, RefreshCw } from 'lucide-react';
import { TreeEngine, TreeStep } from '../engine/trees/TreeEngine';

export const TreeVisualizer: React.FC = () => {
  const [engine] = useState(() => new TreeEngine());
  const [history, setHistory] = useState<TreeStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [insertVal, setInsertVal] = useState<number>(45);

  useEffect(() => {
    setHistory(engine.getHistory());
    setCurrentStepIdx(engine.getHistory().length - 1);
  }, [engine]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStepIdx < history.length - 1) {
      timer = setTimeout(() => {
        setCurrentStepIdx((prev) => prev + 1);
      }, 700);
    } else if (currentStepIdx >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, history.length]);

  const currentStep = history[currentStepIdx] || {
    nodes: {},
    rootId: null,
    heapArray: [],
    description: 'Ready',
  };

  const handleInsert = () => {
    const newHist = engine.insertBST(insertVal);
    setHistory([...newHist]);
    setCurrentStepIdx(newHist.length - 1);
    setInsertVal((prev) => prev + 7);
  };

  const handleInorder = () => {
    const newHist = engine.traverseInorder();
    setHistory([...newHist]);
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  const handleAVLRotate = (type: 'LEFT' | 'RIGHT') => {
    const newHist = engine.rotateAVL(type);
    setHistory([...newHist]);
    setCurrentStepIdx(newHist.length - 1);
  };

  const handleHeapify = (type: 'MIN' | 'MAX') => {
    const newHist = engine.buildHeap(type);
    setHistory([...newHist]);
    setCurrentStepIdx(newHist.length - 1);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white p-6 rounded-2xl overflow-hidden space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/90 p-4 rounded-xl border border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-emerald-400">🌲 Trees & BST & Heaps Lab</h2>
          <p className="text-xs text-slate-400">Hierarchical Node Relations, Rotations, Traversals & Heap arrays</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            value={insertVal}
            onChange={(e) => setInsertVal(Number(e.target.value))}
            className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-emerald-300 font-mono"
          />

          <button
            onClick={handleInsert}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Insert BST</span>
          </button>
          <button
            onClick={handleInorder}
            className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Inorder Traversal</span>
          </button>
          <button
            onClick={() => handleAVLRotate('LEFT')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>AVL Left Rot</span>
          </button>
          <button
            onClick={() => handleHeapify('MAX')}
            className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Max Heapify</span>
          </button>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="flex-1 bg-slate-950/80 rounded-2xl border border-slate-800 p-8 flex flex-col justify-between relative overflow-auto">
        {/* Heap Dual Array Display */}
        {currentStep.heapArray && currentStep.heapArray.length > 0 && (
          <div className="mb-6 bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400 font-bold">HEAP ARRAY REPRESENTATION:</span>
            <div className="flex items-center space-x-2">
              {currentStep.heapArray.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 font-mono">[{idx}]</span>
                  <span className="bg-slate-800 border border-amber-500/40 text-amber-300 font-mono font-bold px-3 py-1.5 rounded-lg text-sm">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tree Hierarchical Graph Visualization */}
        <div className="flex-1 flex items-center justify-center relative min-h-64">
          <div className="grid grid-cols-7 gap-4 items-center justify-items-center w-full max-w-4xl">
            {Object.values(currentStep.nodes).map((node) => {
              const isActive = currentStep.activeNodeId === node.id;
              const isRoot = currentStep.rootId === node.id;

              return (
                <div
                  key={node.id}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-mono font-extrabold text-sm border-2 transition-all duration-300 ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/40 scale-125'
                      : isRoot
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md shadow-emerald-500/30'
                      : 'bg-slate-800 text-slate-100 border-slate-700'
                  }`}
                >
                  <span>{node.value}</span>
                  {isRoot && <span className="text-[8px] uppercase tracking-tighter">ROOT</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Traversal Output banner */}
        {currentStep.traversalResult && (
          <div className="bg-slate-900 border border-purple-500/30 p-3 rounded-xl mb-3 flex items-center justify-between font-mono text-xs">
            <span className="text-purple-400 font-bold">Inorder Traversal Output:</span>
            <span className="text-emerald-300 font-bold text-sm tracking-wider">
              [ {currentStep.traversalResult.join(' ➔ ')} ]
            </span>
          </div>
        )}

        {/* Playback Controls */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Step {currentStepIdx + 1} / {history.length}</span>
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
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg flex items-center space-x-1.5 text-xs"
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
