import React, { useState, useEffect } from 'react';
import { ArrayEngine } from '../engine/array/ArrayEngine';
import { DSASimulationStep } from '../core/types';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  RefreshCw,
  Zap,
  Sparkles,
  BarChart2,
} from 'lucide-react';

export const ArrayLabVisualizer: React.FC = () => {
  const [arrayData, setArrayData] = useState<number[]>([12, 4, 19, 7, 2, 15, 9, 23]);
  const [selectedOperation, setSelectedOperation] = useState<
    'traverse' | 'insert' | 'delete' | 'reverse' | 'rotate' | 'kadane' | 'dutch'
  >('traverse');

  // Input fields
  const [insertVal, setInsertVal] = useState<number>(42);
  const [insertIdx, setInsertIdx] = useState<number>(3);
  const [deleteIdx, setDeleteIdx] = useState<number>(2);
  const [rotateShift, setRotateShift] = useState<number>(2);

  // Simulation step state
  const [steps, setSteps] = useState<DSASimulationStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(600);

  // Generate steps when operation changes
  useEffect(() => {
    let generatedSteps: DSASimulationStep[] = [];
    if (selectedOperation === 'traverse') {
      generatedSteps = ArrayEngine.simulateTraversal(arrayData);
    } else if (selectedOperation === 'insert') {
      generatedSteps = ArrayEngine.simulateInsert(arrayData, insertIdx, insertVal);
    } else if (selectedOperation === 'delete') {
      generatedSteps = ArrayEngine.simulateDelete(arrayData, deleteIdx);
    } else if (selectedOperation === 'reverse') {
      generatedSteps = ArrayEngine.simulateReversal(arrayData);
    } else if (selectedOperation === 'rotate') {
      generatedSteps = ArrayEngine.simulateRotate(arrayData, rotateShift);
    } else if (selectedOperation === 'kadane') {
      generatedSteps = ArrayEngine.simulateKadane(arrayData);
    } else if (selectedOperation === 'dutch') {
      const dnfArray = [2, 0, 1, 2, 1, 0, 2, 1, 0];
      generatedSteps = ArrayEngine.simulateDutchNationalFlag(dnfArray);
    }

    setSteps(generatedSteps);
    setCurrentStepIdx(0);
    setIsPlaying(false);
  }, [selectedOperation, arrayData, insertVal, insertIdx, deleteIdx, rotateShift]);

  // Playback timer
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
    type: 'ARRAY_ACCESS',
    arrayState: arrayData,
    activeIndices: [],
    pointers: {},
    description: 'Initial Array State',
    metrics: { comparisons: 0, swaps: 0, accesses: 0, arrayMutations: 0, elapsedMs: 0 },
  };

  const handleGenerateRandom = () => {
    const newArr = Array.from({ length: 8 }, () => Math.floor(Math.random() * 40) + 1);
    setArrayData(newArr);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-[#fafafa] space-y-6 font-sans select-none text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 uppercase">
              ARRAY LAB & ALGORITHMIC OPERATIONS
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Visualize contiguous array memory indexing, insertion, deletion, two-pointer reversal, Kadane's & Dutch National Flag
            </p>
          </div>

          <button
            onClick={handleGenerateRandom}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-600" />
            <span>Random Array</span>
          </button>
        </div>

        {/* Operation Toolbar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-slate-700 mr-2">Select Operation:</span>

            <button
              onClick={() => setSelectedOperation('traverse')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedOperation === 'traverse' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Traversal
            </button>

            <button
              onClick={() => setSelectedOperation('insert')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedOperation === 'insert' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Insert
            </button>

            <button
              onClick={() => setSelectedOperation('delete')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedOperation === 'delete' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Delete
            </button>

            <button
              onClick={() => setSelectedOperation('reverse')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedOperation === 'reverse' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Two-Pointer Reversal
            </button>

            <button
              onClick={() => setSelectedOperation('rotate')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedOperation === 'rotate' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Left Rotate
            </button>

            <button
              onClick={() => setSelectedOperation('kadane')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedOperation === 'kadane' ? 'bg-cyan-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Kadane's (Max Subarray)
            </button>

            <button
              onClick={() => setSelectedOperation('dutch')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedOperation === 'dutch' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Dutch National Flag (0s, 1s, 2s)
            </button>
          </div>

          {/* Operation Inputs */}
          {selectedOperation === 'insert' && (
            <div className="flex items-center space-x-3 pt-2">
              <span className="text-xs font-bold text-slate-600">Value:</span>
              <input
                type="number"
                value={insertVal}
                onChange={(e) => setInsertVal(Number(e.target.value))}
                className="w-16 p-1 bg-white border border-slate-300 font-bold text-xs rounded-lg text-center"
              />
              <span className="text-xs font-bold text-slate-600">Index:</span>
              <input
                type="number"
                value={insertIdx}
                onChange={(e) => setInsertIdx(Number(e.target.value))}
                className="w-16 p-1 bg-white border border-slate-300 font-bold text-xs rounded-lg text-center"
              />
            </div>
          )}

          {selectedOperation === 'delete' && (
            <div className="flex items-center space-x-3 pt-2">
              <span className="text-xs font-bold text-slate-600">Delete Index:</span>
              <input
                type="number"
                value={deleteIdx}
                onChange={(e) => setDeleteIdx(Number(e.target.value))}
                className="w-16 p-1 bg-white border border-slate-300 font-bold text-xs rounded-lg text-center"
              />
            </div>
          )}

          {selectedOperation === 'rotate' && (
            <div className="flex items-center space-x-3 pt-2">
              <span className="text-xs font-bold text-slate-600">Shift K Positions:</span>
              <input
                type="number"
                value={rotateShift}
                onChange={(e) => setRotateShift(Number(e.target.value))}
                className="w-16 p-1 bg-white border border-slate-300 font-bold text-xs rounded-lg text-center"
              />
            </div>
          )}
        </div>

        {/* Array Graphical Visualizer */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-6 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-cyan-400">ARRAY CONTIGUOUS MEMORY VIEW</span>
            <span className="text-xs font-bold text-slate-400">
              Step {currentStepIdx + 1} / {Math.max(steps.length, 1)}
            </span>
          </div>

          {/* Bar / Cell Array Visualization */}
          <div className="flex items-end justify-center space-x-2 min-h-[160px] py-4 overflow-x-auto">
            {currentStep.arrayState.map((val, idx) => {
              const isActive = currentStep.activeIndices.includes(idx);
              const isSwapping = currentStep.swappingIndices?.includes(idx);
              const isSorted = currentStep.sortedIndices?.includes(idx);
              const isHighlighted =
                currentStep.highlightRange && idx >= currentStep.highlightRange[0] && idx <= currentStep.highlightRange[1];

              let cellStyle = 'bg-slate-800 border-slate-700 text-white';
              if (isSwapping) cellStyle = 'bg-rose-500 border-rose-400 text-white scale-110 shadow-lg';
              else if (isActive) cellStyle = 'bg-cyan-500 border-cyan-400 text-slate-950 font-black scale-110 shadow-lg';
              else if (isHighlighted) cellStyle = 'bg-indigo-600 border-indigo-400 text-white';
              else if (isSorted) cellStyle = 'bg-emerald-600 border-emerald-400 text-white';

              // Pointer label on top
              const pointerKeys = Object.keys(currentStep.pointers).filter(
                (k) => currentStep.pointers[k] === idx
              );

              return (
                <div key={idx} className="flex flex-col items-center space-y-2">
                  {/* Pointer badge */}
                  <div className="h-5 flex items-center justify-center">
                    {pointerKeys.length > 0 && (
                      <span className="text-[10px] font-black bg-cyan-400 text-slate-950 px-1.5 py-0.5 rounded-full uppercase animate-bounce">
                        {pointerKeys.join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Cell Box */}
                  <div
                    className={`w-12 rounded-xl flex flex-col items-center justify-between p-2 transition-all border-2 ${cellStyle}`}
                    style={{ height: `${Math.max(60, Math.min(130, val * 4))}px` }}
                  >
                    <span className="font-mono text-sm font-black">{val}</span>
                  </div>

                  {/* Index badge */}
                  <span className="text-[10px] font-mono text-slate-400">[{idx}]</span>
                </div>
              );
            })}
          </div>

          {/* Description Banner */}
          <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-extrabold text-cyan-300">
            {currentStep.description}
          </div>
        </div>

        {/* Playback Debugger Controller */}
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
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIdx((prev) => Math.min(steps.length - 1, prev + 1));
              }}
              disabled={currentStepIdx >= steps.length - 1}
              className="p-2 bg-white hover:bg-slate-200 disabled:opacity-40 text-slate-800 rounded-lg border border-slate-300 transition"
              title="Next Step"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Operation Metrics Badge */}
          <div className="flex items-center space-x-4 text-xs font-bold text-slate-700">
            <span>Comparisons: <strong className="text-cyan-700">{currentStep.metrics.comparisons}</strong></span>
            <span>Swaps: <strong className="text-rose-600">{currentStep.metrics.swaps}</strong></span>
            <span>Accesses: <strong className="text-indigo-600">{currentStep.metrics.accesses}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
