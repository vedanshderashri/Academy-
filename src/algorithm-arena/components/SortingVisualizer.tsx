import React, { useState, useEffect } from 'react';
import { SortingEngine } from '../engine/sorting/SortingEngine';
import { DSASimulationStep } from '../core/types';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  BarChart,
  Zap,
} from 'lucide-react';

export const SortingVisualizer: React.FC = () => {
  const [arrayData, setArrayData] = useState<number[]>([24, 7, 39, 15, 8, 42, 19, 31, 3]);
  const [algorithm, setAlgorithm] = useState<'bubble' | 'selection' | 'insertion' | 'quick'>('quick');

  const [steps, setSteps] = useState<DSASimulationStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(500);

  useEffect(() => {
    let generatedSteps: DSASimulationStep[] = [];
    if (algorithm === 'bubble') {
      generatedSteps = SortingEngine.simulateBubbleSort(arrayData);
    } else if (algorithm === 'selection') {
      generatedSteps = SortingEngine.simulateSelectionSort(arrayData);
    } else if (algorithm === 'insertion') {
      generatedSteps = SortingEngine.simulateInsertionSort(arrayData);
    } else {
      generatedSteps = SortingEngine.simulateQuickSort(arrayData);
    }

    setSteps(generatedSteps);
    setCurrentStepIdx(0);
    setIsPlaying(false);
  }, [algorithm, arrayData]);

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
    description: 'Initial Unsorted Array State',
    metrics: { comparisons: 0, swaps: 0, accesses: 0, arrayMutations: 0, elapsedMs: 0 },
  };

  const handleShuffle = () => {
    const newArr = Array.from({ length: 9 }, () => Math.floor(Math.random() * 45) + 3);
    setArrayData(newArr);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-[#fafafa] space-y-6 font-sans select-none text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 uppercase">
              SORTING LAB & VISUAL ENGINE
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Watch step-by-step comparisons, swaps, partitions, and memory mutation metrics
            </p>
          </div>

          <button
            onClick={handleShuffle}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-600" />
            <span>Shuffle Data</span>
          </button>
        </div>

        {/* Algorithm Tabs */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold text-slate-700 mr-2">Algorithm:</span>

          <button
            onClick={() => setAlgorithm('bubble')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              algorithm === 'bubble' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Bubble Sort O(N²)
          </button>

          <button
            onClick={() => setAlgorithm('selection')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              algorithm === 'selection' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Selection Sort O(N²)
          </button>

          <button
            onClick={() => setAlgorithm('insertion')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              algorithm === 'insertion' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Insertion Sort O(N²)
          </button>

          <button
            onClick={() => setAlgorithm('quick')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              algorithm === 'quick' ? 'bg-cyan-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Quick Sort O(N log N)
          </button>
        </div>

        {/* Bar Chart Visualizer Canvas */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-6 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-cyan-400 uppercase">
              {algorithm} SORT STEP VISUALIZER
            </span>
            <span className="text-xs font-bold text-slate-400">
              Step {currentStepIdx + 1} / {Math.max(steps.length, 1)}
            </span>
          </div>

          <div className="flex items-end justify-center space-x-3 min-h-[180px] py-4 overflow-x-auto">
            {currentStep.arrayState.map((val, idx) => {
              const isSwapping = currentStep.swappingIndices?.includes(idx);
              const isComparing = currentStep.comparingIndices?.includes(idx);
              const isSorted = currentStep.sortedIndices?.includes(idx);

              let barStyle = 'bg-slate-800 border-slate-700 text-white';
              if (isSwapping) barStyle = 'bg-rose-500 border-rose-400 text-white scale-110 shadow-lg';
              else if (isComparing) barStyle = 'bg-cyan-500 border-cyan-400 text-slate-950 font-black scale-110 shadow-lg';
              else if (isSorted) barStyle = 'bg-emerald-600 border-emerald-400 text-white';

              const pointerKeys = Object.keys(currentStep.pointers).filter(
                (k) => currentStep.pointers[k] === idx
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
                    className={`w-12 rounded-xl flex flex-col items-center justify-end p-2 transition-all border-2 ${barStyle}`}
                    style={{ height: `${Math.max(50, Math.min(140, val * 3.2))}px` }}
                  >
                    <span className="font-mono text-xs font-black">{val}</span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">[{idx}]</span>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-extrabold text-cyan-300">
            {currentStep.description}
          </div>
        </div>

        {/* Debugger Controls & Operational Counters */}
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
              <span>{isPlaying ? 'Pause' : 'Play Sort'}</span>
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
            <span>Swaps: <strong className="text-rose-600">{currentStep.metrics.swaps}</strong></span>
            <span>Array Accesses: <strong className="text-indigo-600">{currentStep.metrics.accesses}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
