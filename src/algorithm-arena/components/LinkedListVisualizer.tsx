import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowRight, Plus, Trash2, Repeat } from 'lucide-react';
import { LinkedListEngine, LLStep } from '../engine/linked-list/LinkedListEngine';

export const LinkedListVisualizer: React.FC = () => {
  const [engine] = useState(() => new LinkedListEngine([10, 20, 30, 40, 50]));
  const [history, setHistory] = useState<LLStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [newValue, setNewValue] = useState<number>(60);
  const [listType, setListType] = useState<'singly' | 'doubly'>('singly');

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
    nodes: [],
    headId: null,
    description: 'Ready',
    pointers: {},
  };

  const handleInsertHead = () => {
    const newHist = engine.insertHead(newValue);
    setHistory([...newHist]);
    setCurrentStepIdx(newHist.length - 1);
    setNewValue((prev) => prev + 10);
  };

  const handleInsertTail = () => {
    const newHist = engine.insertTail(newValue);
    setHistory([...newHist]);
    setCurrentStepIdx(newHist.length - 1);
    setNewValue((prev) => prev + 10);
  };

  const handleDeleteHead = () => {
    const newHist = engine.deleteHead();
    setHistory([...newHist]);
    setCurrentStepIdx(newHist.length - 1);
  };

  const handleReverse = () => {
    const newHist = engine.reverse();
    setHistory([...newHist]);
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  const handleCycleDetect = () => {
    const newHist = engine.detectCycleFastSlow();
    setHistory([...newHist]);
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white p-6 rounded-2xl overflow-hidden space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/90 p-4 rounded-xl border border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-amber-400">🔗 Linked List Lab</h2>
          <p className="text-xs text-slate-400">Dynamic node allocation, pointer manipulation & Floyd's algorithm</p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setListType('singly')}
              className={`px-3 py-1 rounded-md transition ${listType === 'singly' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              Singly
            </button>
            <button
              onClick={() => setListType('doubly')}
              className={`px-3 py-1 rounded-md transition ${listType === 'doubly' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              Doubly
            </button>
          </div>

          <input
            type="number"
            value={newValue}
            onChange={(e) => setNewValue(Number(e.target.value))}
            className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm font-mono text-amber-400 focus:outline-none"
          />

          <button
            onClick={handleInsertHead}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Head</span>
          </button>
          <button
            onClick={handleInsertTail}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tail</span>
          </button>
          <button
            onClick={handleDeleteHead}
            className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Del Head</span>
          </button>
          <button
            onClick={handleReverse}
            className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Reverse</span>
          </button>
          <button
            onClick={handleCycleDetect}
            className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <span>Detect Cycle</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 bg-slate-950/80 rounded-2xl border border-slate-800 p-8 flex flex-col justify-between relative overflow-x-auto">
        {/* Pointer Labels Header */}
        <div className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block" /> HEAD Pointer: {currentStep.headId || 'NULL'}
          </span>
          {Object.entries(currentStep.pointers).map(([pName, pId]) => (
            <span key={pName} className="flex items-center gap-1 font-bold text-amber-400">
              📌 {pName}: {pId || 'NULL'}
            </span>
          ))}
        </div>

        {/* Linked List Nodes Animation Display */}
        <div className="flex items-center space-x-4 py-12 min-w-max">
          {currentStep.nodes.map((node, idx) => {
            const isHead = currentStep.headId === node.id;
            const isCurr = Object.values(currentStep.pointers).includes(node.id);

            return (
              <React.Fragment key={node.id}>
                <div
                  className={`relative flex flex-col items-center bg-slate-800 border-2 ${
                    isHead ? 'border-emerald-400 shadow-lg shadow-emerald-500/20' : isCurr ? 'border-amber-400 scale-105' : 'border-slate-700'
                  } rounded-xl p-4 w-32 transition-all duration-300`}
                >
                  {/* Node Address badge */}
                  <span className="text-[10px] font-mono text-slate-400 mb-1">{node.id}</span>

                  {/* Node Data & Pointer Box */}
                  <div className="flex items-center justify-between w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-center">
                    <span className="text-lg font-bold text-amber-300 flex-1">{node.value}</span>
                    <span className="text-xs text-slate-500 border-l border-slate-700 pl-2">●</span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {isHead && <span className="text-[9px] bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded">HEAD</span>}
                    {Object.entries(currentStep.pointers).map(
                      ([pName, pVal]) => pVal === node.id && <span key={pName} className="text-[9px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded">{pName}</span>
                    )}
                  </div>
                </div>

                {/* Arrow Connector */}
                {node.nextId ? (
                  <div className="flex flex-col items-center text-slate-500">
                    <ArrowRight className="w-6 h-6 text-amber-400 animate-pulse" />
                    {listType === 'doubly' && <span className="text-[9px] font-mono text-slate-400">⇄</span>}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-slate-600 font-mono text-sm font-bold bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                    <span>➔ NULL</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {currentStep.nodes.length === 0 && (
            <div className="text-slate-500 font-mono text-sm text-center w-full py-12">
              Linked List is empty. Click "Head" or "Tail" to add elements.
            </div>
          )}
        </div>

        {/* Step Explanation Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">Step {currentStepIdx + 1} / {history.length}</span>
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
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center space-x-1.5 text-xs"
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
