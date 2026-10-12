import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Crown, Sparkles } from 'lucide-react';
import { BacktrackingEngine, BacktrackStep } from '../engine/backtracking/BacktrackingEngine';

export const BacktrackingVisualizer: React.FC = () => {
  const [engine] = useState(() => new BacktrackingEngine());
  const [history, setHistory] = useState<BacktrackStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    setHistory(engine.getHistory());
    setCurrentStepIdx(engine.getHistory().length - 1);
  }, [engine]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStepIdx < history.length - 1) {
      timer = setTimeout(() => {
        setCurrentStepIdx((prev) => prev + 1);
      }, 500);
    } else if (currentStepIdx >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, history.length]);

  const currentStep = history[currentStepIdx] || {
    board: [[0]],
    queensPlaced: 0,
    description: 'Ready',
    type: 'TRY',
  };

  const handleSolve4Queens = () => {
    const newHist = engine.solveNQueens(4);
    setHistory([...newHist]);
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  const handleSolve8Queens = () => {
    const newHist = engine.solveNQueens(8);
    setHistory([...newHist]);
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white p-6 rounded-2xl overflow-hidden space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/90 p-4 rounded-xl border border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-rose-400">👑 Backtracking & Recursion Lab</h2>
          <p className="text-xs text-slate-400">State-Space Tree Traversal, Constraint Checking & Decision Reversion</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSolve4Queens}
            className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>4-Queens</span>
          </button>
          <button
            onClick={handleSolve8Queens}
            className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>8-Queens</span>
          </button>
        </div>
      </div>

      {/* Main Board Visualizer */}
      <div className="flex-1 bg-slate-950/80 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between overflow-auto">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-slate-900 border-4 border-slate-800 rounded-2xl p-4 shadow-2xl">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${currentStep.board.length}, minmax(0, 1fr))`,
              }}
            >
              {currentStep.board.map((row, rIdx) =>
                row.map((val, cIdx) => {
                  const isDark = (rIdx + cIdx) % 2 === 1;
                  const hasQueen = val === 1;
                  const isActiveCell = currentStep.activeRow === rIdx && currentStep.activeCol === cIdx;

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`w-14 h-14 rounded-lg flex items-center justify-center font-mono text-2xl font-bold transition-all duration-300 ${
                        isActiveCell
                          ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-300 scale-105 z-10'
                          : hasQueen
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50 scale-100'
                          : isDark
                          ? 'bg-slate-800 text-slate-600'
                          : 'bg-slate-700/60 text-slate-600'
                      }`}
                    >
                      {hasQueen ? '👑' : isActiveCell ? '❓' : ''}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="mt-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">Step {currentStepIdx + 1} / {history.length}</span>
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
              className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-lg flex items-center space-x-1.5 text-xs"
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
