import React, { useState } from 'react';
import { SortingEngine } from '../engine/sorting/SortingEngine';
import { Trophy, Zap, RefreshCw, BarChart2, CheckCircle2 } from 'lucide-react';

export const SortingRaceVisualizer: React.FC = () => {
  const [dataSize, setDataSize] = useState<number>(20);
  const [dataDistribution, setDataDistribution] = useState<'random' | 'nearlySorted' | 'reversed'>('random');
  const [raceResults, setRaceResults] = useState<
    { name: string; timeMs: number; comparisons: number; swaps: number; accesses: number; complexity: string }[] | null
  >(null);

  const generateDataset = (size: number, dist: 'random' | 'nearlySorted' | 'reversed'): number[] => {
    if (dist === 'random') {
      return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    } else if (dist === 'reversed') {
      return Array.from({ length: size }, (_, i) => size - i);
    } else {
      // Nearly sorted
      const arr = Array.from({ length: size }, (_, i) => i + 1);
      if (size > 3) {
        const temp = arr[2];
        arr[2] = arr[3];
        arr[3] = temp;
      }
      return arr;
    }
  };

  const handleStartRace = () => {
    const dataset = generateDataset(dataSize, dataDistribution);

    // 1. Bubble Sort
    const t0 = performance.now();
    const bubbleSteps = SortingEngine.simulateBubbleSort(dataset);
    const bubbleTime = performance.now() - t0;
    const bubbleMetrics = bubbleSteps[bubbleSteps.length - 1]?.metrics || { comparisons: 0, swaps: 0, accesses: 0 };

    // 2. Selection Sort
    const t1 = performance.now();
    const selectionSteps = SortingEngine.simulateSelectionSort(dataset);
    const selectionTime = performance.now() - t1;
    const selectionMetrics = selectionSteps[selectionSteps.length - 1]?.metrics || { comparisons: 0, swaps: 0, accesses: 0 };

    // 3. Insertion Sort
    const t2 = performance.now();
    const insertionSteps = SortingEngine.simulateInsertionSort(dataset);
    const insertionTime = performance.now() - t2;
    const insertionMetrics = insertionSteps[insertionSteps.length - 1]?.metrics || { comparisons: 0, swaps: 0, accesses: 0 };

    // 4. Quick Sort
    const t3 = performance.now();
    const quickSteps = SortingEngine.simulateQuickSort(dataset);
    const quickTime = performance.now() - t3;
    const quickMetrics = quickSteps[quickSteps.length - 1]?.metrics || { comparisons: 0, swaps: 0, accesses: 0 };

    const results = [
      { name: 'Quick Sort', timeMs: Number(quickTime.toFixed(2)), comparisons: quickMetrics.comparisons, swaps: quickMetrics.swaps, accesses: quickMetrics.accesses, complexity: 'O(N log N)' },
      { name: 'Insertion Sort', timeMs: Number(insertionTime.toFixed(2)), comparisons: insertionMetrics.comparisons, swaps: insertionMetrics.swaps, accesses: insertionMetrics.accesses, complexity: 'O(N²)' },
      { name: 'Bubble Sort', timeMs: Number(bubbleTime.toFixed(2)), comparisons: bubbleMetrics.comparisons, swaps: bubbleMetrics.swaps, accesses: bubbleMetrics.accesses, complexity: 'O(N²)' },
      { name: 'Selection Sort', timeMs: Number(selectionTime.toFixed(2)), comparisons: selectionMetrics.comparisons, swaps: selectionMetrics.swaps, accesses: selectionMetrics.accesses, complexity: 'O(N²)' },
    ].sort((a, b) => a.comparisons - b.comparisons);

    setRaceResults(results);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-[#fafafa] space-y-6 font-sans select-none text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 uppercase">
              MULTI-ALGORITHM SORTING RACE & BENCHMARK
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Execute Bubble, Selection, Insertion, and Quick Sort in parallel on identical datasets to benchmark efficiency
            </p>
          </div>

          <button
            onClick={handleStartRace}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <Trophy className="w-4 h-4 text-yellow-200" />
            <span>Start Algorithm Race 🏁</span>
          </button>
        </div>

        {/* Configurations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Dataset Size (N Elements):</label>
            <input
              type="number"
              value={dataSize}
              onChange={(e) => setDataSize(Math.max(5, Math.min(50, Number(e.target.value))))}
              className="w-full bg-white border border-slate-300 font-bold text-xs rounded-xl p-2 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Input Distribution Strategy:</label>
            <select
              value={dataDistribution}
              onChange={(e) => setDataDistribution(e.target.value as any)}
              className="w-full bg-white border border-slate-300 font-bold text-xs rounded-xl p-2 focus:outline-none focus:border-amber-500"
            >
              <option value="random">Random Distribution</option>
              <option value="nearlySorted">Nearly Sorted Data</option>
              <option value="reversed">Reverse Sorted (Worst-Case)</option>
            </select>
          </div>
        </div>

        {/* Results Matrix */}
        {raceResults ? (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 font-extrabold text-xs flex items-center justify-between">
              <span>🏆 RACE WINNER: {raceResults[0].name} ({raceResults[0].comparisons} Comparisons)</span>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full uppercase">
                Lowest Operational Overhead
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {raceResults.map((res, idx) => (
                <div
                  key={res.name}
                  className={`p-4 rounded-2xl border transition-all ${
                    idx === 0
                      ? 'bg-amber-500/10 border-amber-400 text-slate-900 shadow-md'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      {idx === 0 && <Trophy className="w-4 h-4 text-amber-600" />}
                      <span>{res.name}</span>
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {res.complexity}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center font-mono text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-sans block">Comparisons</span>
                      <strong className="text-cyan-700 text-sm">{res.comparisons}</strong>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-sans block">Swaps</span>
                      <strong className="text-rose-600 text-sm">{res.swaps}</strong>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-sans block">Accesses</span>
                      <strong className="text-indigo-600 text-sm">{res.accesses}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 font-medium text-xs">
            Click 'Start Algorithm Race 🏁' to execute parallel sorting benchmarks.
          </div>
        )}
      </div>
    </div>
  );
};
