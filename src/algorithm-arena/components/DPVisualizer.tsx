import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Table, Cpu, Package } from 'lucide-react';
import { DPEngine, DPStep } from '../engine/dp/DPEngine';

export const DPVisualizer: React.FC = () => {
  const [engine] = useState(() => new DPEngine());
  const [history, setHistory] = useState<DPStep[]>([]);
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
    matrix: [[]],
    rowLabels: [],
    colLabels: [],
    description: 'Ready',
  };

  const handleKnapsack = () => {
    const newHist = engine.run01Knapsack([2, 3, 4, 5], [3, 4, 5, 6], 5);
    setHistory([...newHist]);
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  const handleLCS = () => {
    const newHist = engine.runLCS('STONE', 'LONGEST');
    setHistory([...newHist]);
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white p-6 rounded-2xl overflow-hidden space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/90 p-4 rounded-xl border border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-amber-400">🧩 Dynamic Programming & Greedy Lab</h2>
          <p className="text-xs text-slate-400">Overlapping Subproblems, Optimal Substructure & 2D Memoization Tables</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleKnapsack}
            className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <Package className="w-3.5 h-3.5" />
            <span>0/1 Knapsack</span>
          </button>
          <button
            onClick={handleLCS}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <Table className="w-3.5 h-3.5" />
            <span>Longest Common Subseq (LCS)</span>
          </button>
        </div>
      </div>

      {/* Main DP Matrix Table Visualizer */}
      <div className="flex-1 bg-slate-950/80 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between overflow-auto">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl font-mono text-sm">
            <table className="border-collapse text-center">
              <thead>
                <tr>
                  <th className="p-3 border border-slate-700 text-amber-400 bg-slate-950"></th>
                  {currentStep.colLabels.map((c, i) => (
                    <th key={i} className="p-3 border border-slate-700 text-amber-400 font-bold bg-slate-950">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentStep.matrix.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="p-3 border border-slate-700 text-amber-400 font-bold bg-slate-950">
                      {currentStep.rowLabels[rIdx]}
                    </td>
                    {row.map((val, cIdx) => {
                      const isActive =
                        currentStep.activeCell && currentStep.activeCell[0] === rIdx && currentStep.activeCell[1] === cIdx;

                      return (
                        <td
                          key={cIdx}
                          className={`p-4 border border-slate-800 font-bold text-base transition-all duration-300 ${
                            isActive
                              ? 'bg-amber-400 text-slate-950 scale-110 shadow-lg shadow-amber-400/50'
                              : val > 0
                              ? 'bg-slate-800 text-emerald-400'
                              : 'text-slate-600'
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer controls */}
        <div className="mt-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
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
