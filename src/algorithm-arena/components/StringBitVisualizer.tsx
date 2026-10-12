import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Binary, Search, Cpu } from 'lucide-react';
import { StringBitEngine, StringBitStep } from '../engine/strings/StringBitEngine';

export const StringBitVisualizer: React.FC = () => {
  const [engine] = useState(() => new StringBitEngine());
  const [history, setHistory] = useState<StringBitStep[]>([]);
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
      }, 600);
    } else if (currentStepIdx >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, history.length]);

  const currentStep = history[currentStepIdx] || {
    description: 'Ready',
    type: 'KMP',
  };

  const handleKMP = () => {
    const newHist = engine.runKMP('ABABDABACDABABCABAB', 'ABABCABAB');
    setHistory([...newHist]);
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  const handleBitwise = (op: 'AND' | 'OR' | 'XOR' | 'LSHIFT') => {
    const newHist = engine.runBitwise(29, 15, op);
    setHistory([...newHist]);
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white p-6 rounded-2xl overflow-hidden space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/90 p-4 rounded-xl border border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-amber-400">🔤 Strings & Bit Manipulation Lab</h2>
          <p className="text-xs text-slate-400">KMP String Matching, LPS Failure Function & Bitwise Binary Registers</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleKMP}
            className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>KMP Pattern Match</span>
          </button>
          <button
            onClick={() => handleBitwise('AND')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Bitwise AND</span>
          </button>
          <button
            onClick={() => handleBitwise('XOR')}
            className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Bitwise XOR</span>
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex-1 bg-slate-950/80 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between overflow-auto">
        {/* KMP VISUALIZER */}
        {currentStep.type === 'KMP' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            {/* Text String Display */}
            <div className="flex flex-col items-start w-full max-w-3xl space-y-1">
              <span className="text-xs font-mono text-slate-400">Search Text string:</span>
              <div className="flex space-x-1 bg-slate-900 border border-slate-800 p-3 rounded-xl w-full overflow-x-auto">
                {currentStep.text?.split('').map((char, idx) => {
                  const isMatchRange =
                    currentStep.matchIndex !== undefined &&
                    idx >= currentStep.matchIndex &&
                    idx < currentStep.matchIndex + (currentStep.pattern?.length || 0);

                  return (
                    <div
                      key={idx}
                      className={`w-9 h-11 rounded-lg flex flex-col items-center justify-center font-mono font-bold text-sm border ${
                        isMatchRange ? 'bg-amber-500 text-slate-950 border-amber-300' : 'bg-slate-800 text-slate-200 border-slate-700'
                      }`}
                    >
                      <span className="text-[9px] text-slate-400 font-normal">{idx}</span>
                      <span>{char}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pattern Window */}
            {currentStep.pattern && (
              <div className="flex flex-col items-start w-full max-w-3xl space-y-1">
                <span className="text-xs font-mono text-amber-400 font-bold">Pattern to Match:</span>
                <div className="flex space-x-1 bg-slate-900 border border-amber-500/40 p-3 rounded-xl">
                  {currentStep.pattern.split('').map((char, idx) => (
                    <div
                      key={idx}
                      className="w-9 h-11 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 flex flex-col items-center justify-center font-mono font-bold text-sm"
                    >
                      <span className="text-[9px] text-amber-500 font-normal">{idx}</span>
                      <span>{char}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BITWISE VISUALIZER */}
        {currentStep.type === 'BITWISE' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-xl w-full font-mono text-sm space-y-4 shadow-2xl">
              <h3 className="text-amber-400 font-bold text-base text-center border-b border-slate-800 pb-2">
                BITWISE {currentStep.bitOp} REGISTER PIPELINE
              </h3>

              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold">A = {currentStep.bitNum1}</span>
                <span className="text-emerald-400 font-mono text-base font-bold tracking-widest">
                  {currentStep.bitNum1?.toString(2).padStart(8, '0')}
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold">B = {currentStep.bitNum2}</span>
                <span className="text-emerald-400 font-mono text-base font-bold tracking-widest">
                  {currentStep.bitNum2?.toString(2).padStart(8, '0')}
                </span>
              </div>

              <div className="flex items-center justify-between bg-amber-400 text-slate-950 p-3.5 rounded-xl font-bold shadow-lg">
                <span>RESULT ({currentStep.bitOp}) = {currentStep.bitResult}</span>
                <span className="font-mono text-lg tracking-widest">
                  {currentStep.bitResult?.toString(2).padStart(8, '0')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Playback Controls */}
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
