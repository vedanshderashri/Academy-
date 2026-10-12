import React, { useState } from 'react';
import { ArrayLabVisualizer } from './ArrayLabVisualizer';
import { SearchingVisualizer } from './SearchingVisualizer';
import { SortingVisualizer } from './SortingVisualizer';
import { SortingRaceVisualizer } from './SortingRaceVisualizer';
import { ComplexityAnalyzer } from './ComplexityAnalyzer';
import { LinkedListVisualizer } from './LinkedListVisualizer';
import { StackQueueVisualizer } from './StackQueueVisualizer';
import { TreeVisualizer } from './TreeVisualizer';
import { GraphVisualizer } from './GraphVisualizer';
import { DPVisualizer } from './DPVisualizer';
import { BacktrackingVisualizer } from './BacktrackingVisualizer';
import { StringBitVisualizer } from './StringBitVisualizer';
import {
  Zap,
  Search,
  BarChart2,
  Trophy,
  TrendingUp,
  Layers,
  Link,
  Layers3,
  Network,
  GitPullRequest,
  Table,
  Crown,
  Binary,
} from 'lucide-react';

export type DSATab =
  | 'array'
  | 'linkedlist'
  | 'stackqueue'
  | 'searching'
  | 'sorting'
  | 'trees'
  | 'graphs'
  | 'dp'
  | 'backtracking'
  | 'strings'
  | 'race'
  | 'complexity';

export const AlgorithmArenaView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DSATab>('array');

  return (
    <div className="w-full h-full bg-[#fefefe] flex flex-col font-sans select-none overflow-hidden text-slate-900">
      {/* Top Algorithm Arena Module Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-[#18181b] text-white flex items-center justify-center font-black text-sm shadow-xs">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900">ALGORITHM ARENA</h2>
            <p className="text-[11px] font-semibold text-slate-500">
              Complete DSA Simulation & Visualization Suite (Arrays, Linked Lists, Stacks, Trees, Graphs, DP, Backtracking)
            </p>
          </div>
        </div>

        {/* Comprehensive Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('array')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'array' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Arrays</span>
          </button>

          <button
            onClick={() => setActiveTab('linkedlist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'linkedlist' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link className="w-3.5 h-3.5 text-amber-400" />
            <span>Linked Lists</span>
          </button>

          <button
            onClick={() => setActiveTab('stackqueue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'stackqueue' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Stack & Queue</span>
          </button>

          <button
            onClick={() => setActiveTab('searching')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'searching' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            <span>Searching</span>
          </button>

          <button
            onClick={() => setActiveTab('sorting')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sorting' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Sorting</span>
          </button>

          <button
            onClick={() => setActiveTab('trees')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'trees' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />
            <span>Trees & Heaps</span>
          </button>

          <button
            onClick={() => setActiveTab('graphs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'graphs' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span>Graphs</span>
          </button>

          <button
            onClick={() => setActiveTab('dp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'dp' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-amber-400" />
            <span>Dynamic Prog</span>
          </button>

          <button
            onClick={() => setActiveTab('backtracking')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'backtracking' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-rose-400" />
            <span>Backtracking</span>
          </button>

          <button
            onClick={() => setActiveTab('strings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'strings' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Binary className="w-3.5 h-3.5 text-blue-400" />
            <span>Strings & Bits</span>
          </button>

          <button
            onClick={() => setActiveTab('race')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'race' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Sort Race</span>
          </button>

          <button
            onClick={() => setActiveTab('complexity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'complexity' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Big-O</span>
          </button>
        </div>
      </div>

      {/* Main Mode Content Area */}
      <div className="flex-1 flex overflow-hidden p-3">
        {activeTab === 'array' ? (
          <ArrayLabVisualizer />
        ) : activeTab === 'linkedlist' ? (
          <LinkedListVisualizer />
        ) : activeTab === 'stackqueue' ? (
          <StackQueueVisualizer />
        ) : activeTab === 'searching' ? (
          <SearchingVisualizer />
        ) : activeTab === 'sorting' ? (
          <SortingVisualizer />
        ) : activeTab === 'trees' ? (
          <TreeVisualizer />
        ) : activeTab === 'graphs' ? (
          <GraphVisualizer />
        ) : activeTab === 'dp' ? (
          <DPVisualizer />
        ) : activeTab === 'backtracking' ? (
          <BacktrackingVisualizer />
        ) : activeTab === 'strings' ? (
          <StringBitVisualizer />
        ) : activeTab === 'race' ? (
          <SortingRaceVisualizer />
        ) : (
          <ComplexityAnalyzer />
        )}
      </div>
    </div>
  );
};
