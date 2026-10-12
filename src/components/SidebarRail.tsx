import React from 'react';
import {
  Trophy,
  Cpu,
  Award,
  LayoutGrid,
  Zap,
  Binary,
  Globe,
  Sparkles,
  LogOut,
  User,
  FlaskConical,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export type AppTab =
  // Computer Networks
  | 'net-arena'
  | 'net-workbench'
  | 'net-quiz'
  | 'net-dashboard'
  // Data Structures & Algorithms
  | 'dsa-arena'
  | 'dsa-lab'
  | 'dsa-quiz'
  | 'dsa-dashboard'
  // Theory of Computation
  | 'toc-arena'
  | 'toc-lab'
  | 'toc-quiz'
  | 'toc-dashboard';

interface SidebarRailProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenAuth: () => void;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
}) => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-56 md:w-64 bg-[#18181b] flex flex-col justify-between p-4 text-slate-400 select-none flex-shrink-0 border-r border-slate-800/80 overflow-y-auto">
      {/* Brand Header */}
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="w-10 h-10 bg-[#fef08a] text-slate-900 rounded-2xl flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-slate-900 fill-slate-900" />
          </div>
          <div>
            <h1 className="text-white font-extrabold text-sm tracking-tight font-sans">
              CSE Academy
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Educational Platform</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex flex-col space-y-6">
          {/* SECTION 1: COMPUTER NETWORKS */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 px-2 pb-1 text-slate-400 text-[11px] font-mono uppercase tracking-wider font-extrabold border-b border-slate-800">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-indigo-300">Networks</span>
            </div>

            <button
              onClick={() => setActiveTab('net-arena')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'net-arena'
                  ? 'bg-indigo-600 text-white shadow-md scale-[1.02]'
                  : 'hover:bg-slate-800/80 hover:text-slate-200 text-slate-400'
              }`}
            >
              <Trophy className="w-4 h-4 text-indigo-400" />
              <span>Networks Arena</span>
            </button>

            <button
              onClick={() => setActiveTab('net-workbench')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'net-workbench'
                  ? 'bg-indigo-600 text-white shadow-md scale-[1.02]'
                  : 'hover:bg-slate-800/80 hover:text-slate-200 text-slate-400'
              }`}
            >
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Workbench</span>
            </button>

            <button
              onClick={() => setActiveTab('net-quiz')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'net-quiz'
                  ? 'bg-indigo-600 text-white shadow-md scale-[1.02]'
                  : 'hover:bg-slate-800/80 hover:text-slate-200 text-slate-400'
              }`}
            >
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Networks Quiz</span>
            </button>

            <button
              onClick={() => setActiveTab('net-dashboard')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'net-dashboard'
                  ? 'bg-indigo-600 text-white shadow-md scale-[1.02]'
                  : 'hover:bg-slate-800/80 hover:text-slate-200 text-slate-400'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-indigo-400" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* SECTION 2: DATA STRUCTURES & ALGORITHMS */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 px-2 pb-1 text-slate-400 text-[11px] font-mono uppercase tracking-wider font-extrabold border-b border-slate-800">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-amber-300">DSA Arena</span>
            </div>

            <button
              onClick={() => setActiveTab('dsa-arena')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dsa-arena'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                  : 'hover:bg-slate-800/80 hover:text-slate-200 text-slate-400'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>DSA Arena</span>
            </button>

            <button
              onClick={() => setActiveTab('dsa-lab')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dsa-lab'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                  : 'hover:bg-slate-800/80 hover:text-slate-200 text-slate-400'
              }`}
            >
              <FlaskConical className="w-4 h-4 text-amber-400" />
              <span>Lab Simulation</span>
            </button>

            <button
              onClick={() => setActiveTab('dsa-quiz')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dsa-quiz'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                  : 'hover:bg-slate-800/80 hover:text-slate-200 text-slate-400'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>DSA Quiz</span>
            </button>

            <button
              onClick={() => setActiveTab('dsa-dashboard')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dsa-dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                  : 'hover:bg-slate-800/80 hover:text-slate-200 text-slate-400'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-amber-400" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* SECTION 3: THEORY OF COMPUTATION */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 px-2 pb-1 text-slate-400 text-[11px] font-mono uppercase tracking-wider font-extrabold border-b border-slate-800">
              <Binary className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-300">TOC Lab</span>
            </div>

            <button
              onClick={() => setActiveTab('toc-arena')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'toc-arena'
                  ? 'bg-cyan-500 text-slate-950 shadow-md scale-[1.02]'
                  : 'hover:bg-slate-800/80 hover:text-slate-200 text-slate-400'
              }`}
            >
              <Trophy className="w-4 h-4 text-cyan-400" />
              <span>TOC Arena</span>
            </button>

            <button
              onClick={() => setActiveTab('toc-lab')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'toc-lab'
                  ? 'bg-cyan-500 text-slate-950 shadow-md scale-[1.02]'
                  : 'hover:bg-slate-800/80 hover:text-slate-200 text-slate-400'
              }`}
            >
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <span>Lab Simulation</span>
            </button>

            <button
              onClick={() => setActiveTab('toc-quiz')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'toc-quiz'
                  ? 'bg-cyan-500 text-slate-950 shadow-md scale-[1.02]'
                  : 'hover:bg-slate-800/80 hover:text-slate-200 text-slate-400'
              }`}
            >
              <Award className="w-4 h-4 text-cyan-400" />
              <span>TOC Quiz</span>
            </button>

            <button
              onClick={() => setActiveTab('toc-dashboard')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'toc-dashboard'
                  ? 'bg-cyan-500 text-slate-950 shadow-md scale-[1.02]'
                  : 'hover:bg-slate-800/80 hover:text-slate-200 text-slate-400'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-cyan-400" />
              <span>Dashboard</span>
            </button>
          </div>
        </nav>
      </div>

      {/* User Footer */}
      <div className="pt-4 border-t border-slate-800/80">
        {user ? (
          <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center justify-center text-xs">
                {user.username[0]?.toUpperCase()}
              </div>
              <div className="truncate w-24">
                <span className="text-xs font-bold text-white block truncate">{user.username}</span>
                <span className="text-[9px] text-slate-500 block truncate">{user.email || 'Student'}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-xs transition"
          >
            <User className="w-4 h-4" />
            <span>Student Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
};
