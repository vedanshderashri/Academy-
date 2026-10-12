import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown, Plus, Trash2, Code2 } from 'lucide-react';
import { StackQueueEngine, StackQueueStep } from '../engine/stack-queue/StackQueueEngine';

export const StackQueueVisualizer: React.FC = () => {
  const [engine] = useState(() => new StackQueueEngine());
  const [history, setHistory] = useState<StackQueueStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [pushVal, setPushVal] = useState<number>(50);
  const [enqueueVal, setEnqueueVal] = useState<number>(400);
  const [infixInput, setInfixInput] = useState<string>('A+B*(C-D)');

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
    stackItems: [],
    queueItems: [],
    description: 'Ready',
  };

  const handlePush = () => {
    const newHist = engine.pushStack(pushVal);
    setHistory([...newHist]);
    setCurrentStepIdx(newHist.length - 1);
    setPushVal((prev) => prev + 5);
  };

  const handlePop = () => {
    const newHist = engine.popStack();
    setHistory([...newHist]);
    setCurrentStepIdx(newHist.length - 1);
  };

  const handleEnqueue = () => {
    const newHist = engine.enqueue(enqueueVal);
    setHistory([...newHist]);
    setCurrentStepIdx(newHist.length - 1);
    setEnqueueVal((prev) => prev + 100);
  };

  const handleDequeue = () => {
    const newHist = engine.dequeue();
    setHistory([...newHist]);
    setCurrentStepIdx(newHist.length - 1);
  };

  const handleInfixToPostfix = () => {
    const newHist = engine.convertInfixToPostfix(infixInput);
    setHistory([...newHist]);
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white p-6 rounded-2xl overflow-hidden space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/90 p-4 rounded-xl border border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-cyan-400">🥞 Stack & Queue Lab</h2>
          <p className="text-xs text-slate-400">LIFO vs FIFO memory semantics & Expression Evaluation</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Stack Controls */}
          <div className="flex items-center space-x-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-700">
            <span className="text-xs font-mono font-bold text-amber-400 px-1">Stack:</span>
            <input
              type="number"
              value={pushVal}
              onChange={(e) => setPushVal(Number(e.target.value))}
              className="w-14 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-amber-300 font-mono"
            />
            <button
              onClick={handlePush}
              className="bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Push</span>
            </button>
            <button
              onClick={handlePop}
              className="bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Pop</span>
            </button>
          </div>

          {/* Queue Controls */}
          <div className="flex items-center space-x-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-700">
            <span className="text-xs font-mono font-bold text-emerald-400 px-1">Queue:</span>
            <input
              type="number"
              value={enqueueVal}
              onChange={(e) => setEnqueueVal(Number(e.target.value))}
              className="w-14 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-emerald-300 font-mono"
            />
            <button
              onClick={handleEnqueue}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Enqueue</span>
            </button>
            <button
              onClick={handleDequeue}
              className="bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Dequeue</span>
            </button>
          </div>

          {/* Expression Eval */}
          <div className="flex items-center space-x-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-700">
            <input
              type="text"
              value={infixInput}
              onChange={(e) => setInfixInput(e.target.value)}
              className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-cyan-300 font-mono"
            />
            <button
              onClick={handleInfixToPostfix}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Infix ➔ Postfix</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visualizers Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* STACK PANEL (LIFO Vertical Container) */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-between relative">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🥞</span>
              <span className="font-bold text-amber-400 font-mono">STACK (LIFO)</span>
            </div>
            <span className="text-xs font-mono text-slate-400">TOP ➔ Index {currentStep.stackItems.length - 1}</span>
          </div>

          {/* Vertical Stack Frame Visualizer */}
          <div className="w-48 h-64 border-2 border-t-0 border-amber-500/40 rounded-b-2xl bg-slate-900/60 p-3 flex flex-col-reverse justify-start space-y-reverse space-y-2 overflow-y-auto relative shadow-inner">
            {currentStep.stackItems.map((val, idx) => {
              const isTop = idx === currentStep.stackItems.length - 1;
              return (
                <div
                  key={idx}
                  className={`w-full py-2.5 rounded-xl flex items-center justify-between px-4 font-mono font-bold transition-all duration-300 ${
                    isTop ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-105' : 'bg-slate-800 text-amber-200 border border-slate-700'
                  }`}
                >
                  <span className="text-sm">{val}</span>
                  {isTop && <span className="text-[10px] bg-slate-950 text-amber-400 px-1.5 py-0.5 rounded font-extrabold">TOP</span>}
                </div>
              );
            })}

            {currentStep.stackItems.length === 0 && (
              <div className="text-slate-600 text-xs font-mono text-center my-auto">Stack Empty</div>
            )}
          </div>

          <div className="mt-4 text-xs font-mono text-slate-400">Size: {currentStep.stackItems.length} / 8</div>
        </div>

        {/* QUEUE PANEL (FIFO Horizontal Pipeline) */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between relative">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🚪</span>
              <span className="font-bold text-emerald-400 font-mono">QUEUE (FIFO)</span>
            </div>
            <div className="flex space-x-3 text-xs font-mono text-slate-400">
              <span className="text-emerald-400 font-bold">FRONT ➔ Out</span>
              <span className="text-blue-400 font-bold">In  REAR</span>
            </div>
          </div>

          {/* Horizontal Queue Pipeline Visualizer */}
          <div className="w-full h-48 border-2 border-emerald-500/40 rounded-2xl bg-slate-900/60 p-4 flex items-center justify-start space-x-3 overflow-x-auto relative shadow-inner">
            {currentStep.queueItems.map((val, idx) => {
              const isFront = idx === 0;
              const isRear = idx === currentStep.queueItems.length - 1;
              return (
                <div
                  key={idx}
                  className={`min-w-24 h-24 rounded-2xl flex flex-col items-center justify-center font-mono font-bold transition-all duration-300 border ${
                    isFront
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105'
                      : isRear
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-slate-800 text-emerald-300 border-slate-700'
                  }`}
                >
                  <span className="text-lg">{val}</span>
                  <div className="flex gap-1 mt-1">
                    {isFront && <span className="text-[9px] bg-slate-950 text-emerald-400 px-1 rounded">FRONT</span>}
                    {isRear && <span className="text-[9px] bg-slate-950 text-blue-300 px-1 rounded">REAR</span>}
                  </div>
                </div>
              );
            })}

            {currentStep.queueItems.length === 0 && (
              <div className="text-slate-600 text-xs font-mono text-center w-full">Queue Empty</div>
            )}
          </div>

          {currentStep.postfixExpr && (
            <div className="mt-2 bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs">
              <span className="text-cyan-400 font-bold">Postfix Result: </span>
              <span className="text-amber-300 font-bold text-sm tracking-widest">{currentStep.postfixExpr}</span>
            </div>
          )}
        </div>
      </div>

      {/* Simulation Controls Banner */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
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
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300"
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
  );
};
