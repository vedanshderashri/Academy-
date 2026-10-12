import React, { useState, useEffect } from 'react';
import { SearchingEngine } from '../engine/searching/SearchingEngine';
import { DSASimulationStep } from '../core/types';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Search,
  RefreshCw,
  Zap,
} from 'lucide-react';

export const SearchingVisualizer: React.FC = () => {
  const [arrayData, setArrayData] = useState<number[]>([3, 8, 12, 19, 25, 31, 42, 57, 64, 78, 89, 95]);
  const [searchTarget, setSearchTarget] = useState<number>(42);
  const [searchAlgorithm, setSearchAlgorithm] = useState<'linear' | 'binary'>('binary');

  // Simulation steps
  const [steps, setSteps] = useState<DSASimulationStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(600);

  useEffect(() => {
    let generatedSteps: DSASimulationStep[] = [];
    if (searchAlgorithm === 'linear') {
      generatedSteps = SearchingEngine.simulateLinearSearch(arrayData, searchTarget);
    } else {
      generatedSteps = SearchingEngine.simulateBinarySearch(arrayData, searchTarget);
    }

    setSteps(generatedSteps);
    setCurrentStepIdx(0);
    setIsPlaying(false);
  }, [searchAlgorithm, searchTarget, arrayData]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStepIdx < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStepIdx((prev) => prev + 1);
      }, playbackSpeed);
    } else if (currentStepIdx >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, steps.length, playbackSpeed]);

  const currentStep = steps[currentStepIdx] || {
    stepIndex: 0,
    type: 'COMPARISON',
    arrayState: arrayData,
    activeIndices: [],
    pointers: {},
    description: 'Initial Search State',
    metrics: { comparisons: 0, swaps: 0, accesses: 0, arrayMutations: 0, elapsedMs: 0 },
  };

  const handleGenerateRandom = () => {
    const newArr = Array.from({ length: 12 }, () => Math.floor(Math.random() * 90) + 5).sort((a, b) => a - b);
    setArrayData(newArr);
    setSearchTarget(newArr[Math.floor(Math.random() * newArr.length)]);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-[#fafafa] space-y-6 font-sans select-none text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 uppercase">
              SEARCHING ALGORITHMS LAB
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Visualize Linear Search O(N) vs Binary Search O(log N) interval shrinking with Low, Mid, and High pointers
            </p>
          </div>

          <button
            onClick={handleGenerateRandom}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-600" />
            <span>Generate Sorted Array</span>
          </button>
        </div>

        {/* Algorithm Toolbar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold text-slate-700">Algorithm:</span>
            <button
              onClick={() => setSearchAlgorithm('linear')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                searchAlgorithm === 'linear' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Linear Search O(N)
            </button>

            <button
              onClick={() => setSearchAlgorithm('binary')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                searchAlgorithm === 'binary' ? 'bg-cyan-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Binary Search O(log N)
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700">Search Target Value:</span>
            <input
              type="number"
              value={searchTarget}
              onChange={(e) => setSearchTarget(Number(e.target.value))}
              className="w-20 p-1.5 bg-white border border-slate-300 font-bold text-xs rounded-xl text-center focus:outline-none focus:border-cyan-600"
            />
          </div>
        </div>

        {/* Visualizer Canvas Area */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-6 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-cyan-400">
              {searchAlgorithm === 'binary' ? 'BINARY SEARCH INTERVAL (LOW..HIGH)' : 'SEQUENTIAL ACCESS TRAVERSAL'}
            </span>
            <span className="text-xs font-bold text-slate-400">
              Step {currentStepIdx + 1} / {Math.max(steps.length, 1)}
            </span>
          </div>

          {/* Array Cell Visualization */}
          <div className="flex items-end justify-center space-x-2 min-h-[160px] py-4 overflow-x-auto">
            {currentStep.arrayState.map((val, idx) => {
              const isMatch = currentStep.sortedIndices?.includes(idx);
              const isComparing = currentStep.comparingIndices?.includes(idx);
              const inRange =
                currentStep.highlightRange && idx >= currentStep.highlightRange[0] && idx <= currentStep.highlightRange[1];

              let cellStyle = 'bg-slate-800 border-slate-700 text-slate-400';
              if (isMatch) cellStyle = 'bg-emerald-500 border-emerald-400 text-white scale-110 shadow-lg';
              else if (isComparing) cellStyle = 'bg-cyan-500 border-cyan-400 text-slate-950 font-black scale-110 shadow-lg';
              else if (inRange) cellStyle = 'bg-indigo-950 border-indigo-500 text-white';

              const pointerKeys = Object.keys(currentStep.pointers).filter(
                (k) => currentStep.pointers[k] === idx && k !== 'target'
              );

              return (
                <div key={idx} className="flex flex-col items-center space-y-2">
                  <div className="h-5 flex items-center justify-center">
                    {pointerKeys.length > 0 && (
                      <span className="text-[10px] font-black bg-cyan-400 text-slate-950 px-1.5 py-0.5 rounded-full uppercase animate-bounce">
                        {pointerKeys.join(', ')}
                      </span>
                    )}
                  </div>

                  <div
                    className={`w-11 h-14 rounded-xl flex items-center justify-center border-2 transition-all font-mono text-sm font-black ${cellStyle}`}
                  >
                    {val}
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">[{idx}]</span>
                </div>
              );
            })}
          </div>

          {/* Step Description */}
          <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-extrabold text-cyan-300">
            {currentStep.description}
          </div>
        </div>

        {/* Debugger Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIdx(0);
              }}
              className="p-2 bg-white hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 transition"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIdx((prev) => Math.max(0, prev - 1));
              }}
              disabled={currentStepIdx === 0}
              className="p-2 bg-white hover:bg-slate-200 disabled:opacity-40 text-slate-800 rounded-lg border border-slate-300 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'Pause' : 'Play Search'}</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIdx((prev) => Math.min(steps.length - 1, prev + 1));
              }}
              disabled={currentStepIdx >= steps.length - 1}
              className="p-2 bg-white hover:bg-slate-200 disabled:opacity-40 text-slate-800 rounded-lg border border-slate-300 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-4 text-xs font-bold text-slate-700">
            <span>Comparisons: <strong className="text-cyan-700">{currentStep.metrics.comparisons}</strong></span>
            <span>Memory Accesses: <strong className="text-indigo-600">{currentStep.metrics.accesses}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
