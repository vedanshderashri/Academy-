import React, { useState } from 'react';
import { TrendingUp, Activity, Sparkles, Layers } from 'lucide-react';

export const ComplexityAnalyzer: React.FC = () => {
  const [inputN, setInputN] = useState<number>(20);

  // Compute operational steps for given N
  const constant = 1;
  const logN = Math.round(Math.log2(inputN));
  const linear = inputN;
  const nLogN = Math.round(inputN * Math.log2(inputN));
  const quadratic = inputN * inputN;

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-[#fafafa] space-y-6 font-sans select-none text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 uppercase">
              BIG-O COMPLEXITY LAB & GROWTH ANALYZER
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Analyze theoretical asymptotic growth curves and runtime scaling as input size N increases
            </p>
          </div>

          <span className="bg-indigo-100 text-indigo-900 border border-indigo-300 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Asymptotic Analysis</span>
          </span>
        </div>

        {/* Input N Slider */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Set Input Size (N):</span>
            <span className="text-sm font-mono font-black text-indigo-600">N = {inputN} elements</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            value={inputN}
            onChange={(e) => setInputN(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Complexity Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* O(1) */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-black text-emerald-900 block">O(1) - Constant</span>
            <div className="text-2xl font-black font-mono text-emerald-700">{constant} ops</div>
            <p className="text-[11px] text-emerald-800 font-medium">Hash table lookup, Array indexing</p>
          </div>

          {/* O(log N) */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-black text-cyan-900 block">O(log N) - Logarithmic</span>
            <div className="text-2xl font-black font-mono text-cyan-700">{logN} ops</div>
            <p className="text-[11px] text-cyan-800 font-medium">Binary search, BST operations</p>
          </div>

          {/* O(N) */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-black text-blue-900 block">O(N) - Linear</span>
            <div className="text-2xl font-black font-mono text-blue-700">{linear} ops</div>
            <p className="text-[11px] text-blue-800 font-medium">Linear search, Array traversal</p>
          </div>

          {/* O(N log N) */}
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-black text-purple-900 block">O(N log N) - Linearithmic</span>
            <div className="text-2xl font-black font-mono text-purple-700">{nLogN} ops</div>
            <p className="text-[11px] text-purple-800 font-medium">Merge Sort, Quick Sort, Heap Sort</p>
          </div>

          {/* O(N^2) */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-black text-rose-900 block">O(N²) - Quadratic</span>
            <div className="text-2xl font-black font-mono text-rose-700">{quadratic} ops</div>
            <p className="text-[11px] text-rose-800 font-medium">Bubble Sort, Selection Sort, Nested loops</p>
          </div>
        </div>
      </div>
    </div>
  );
};
