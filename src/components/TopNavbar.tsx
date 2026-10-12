import React from 'react';
import {
  Activity,
  Bot,
  Calculator,
  ShieldAlert,
  Search,
  Bell,
  ChevronDown,
  User as UserIcon,
  Sparkles,
  Brain,
  Globe,
  Layers,
  Zap,
} from 'lucide-react';
import { NOCMetrics } from '../types/network';
import { useAuth } from '../auth/AuthContext';
import { AppTab } from './SidebarRail';

export type SubjectType = 'ALL' | 'DSA' | 'TOC' | 'NETWORKS';

interface TopNavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  currentSubject: SubjectType;
  setCurrentSubject: (subject: SubjectType) => void;
  metrics: NOCMetrics;
  isPaused: boolean;
  speedMultiplier: number;
  onTogglePause: () => void;
  onChangeSpeed: (speed: number) => void;
  onOpenAI: () => void;
  onOpenSubnetCalc: () => void;
  onOpenSecurity: () => void;
  onOpenAuth: () => void;
  currentMissionTitle?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  metrics,
  isPaused,
  speedMultiplier,
  onTogglePause,
  onChangeSpeed,
  onOpenAI,
  onOpenSubnetCalc,
  onOpenSecurity,
  onOpenAuth,
}) => {
  const { user } = useAuth();

  const getTabHeader = () => {
    switch (activeTab) {
      // Computer Networks
      case 'net-arena':
        return { title: '🌐 Computer Networks Arena', badge: 'Missions & Challenges', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'net-workbench':
        return { title: '🌐 Computer Networks Workbench', badge: '2D Topology & Wireshark', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'net-quiz':
        return { title: '📝 Networks Assessments & Quizzes', badge: 'OSI, TCP/IP, Subnetting', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'net-dashboard':
        return { title: '📊 Networks Student Dashboard', badge: 'LMS Progress & Analytics', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };

      // Data Structures & Algorithms
      case 'dsa-arena':
        return { title: '⚡ DSA Algorithm Arena', badge: 'Sorting Races & Benchmarks', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'dsa-lab':
        return { title: '🧪 DSA Lab Simulation Suite', badge: '12 Interactive Engines', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'dsa-quiz':
        return { title: '📝 DSA Algorithmic Quizzes', badge: 'Complexity, Trees, Graphs', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'dsa-dashboard':
        return { title: '📊 DSA Student Dashboard', badge: 'LMS Progress & Analytics', color: 'bg-amber-50 text-amber-700 border-amber-200' };

      // Theory of Computation
      case 'toc-arena':
        return { title: '🧠 TOC Arena Missions', badge: 'Formal Languages & Automata', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'toc-lab':
        return { title: '🧪 TOC Workbenches & Simulators', badge: 'DFA, NFA, PDA, Turing Machine', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'toc-quiz':
        return { title: '📝 TOC Theory Assessments', badge: 'Chomsky & Decidability', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'toc-dashboard':
        return { title: '📊 TOC Student Dashboard', badge: 'LMS Progress & Analytics', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };

      default:
        return { title: 'CSE Educational Platform', badge: 'v1.0.0', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const headerInfo = getTabHeader();

  return (
    <header className="bg-white border-b border-slate-100 text-slate-900 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 select-none z-30">
      {/* Title & Badge */}
      <div className="flex items-center space-x-3">
        <h1 className="font-extrabold text-lg tracking-tight text-slate-900 font-sans">
          {headerInfo.title}
        </h1>
        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${headerInfo.color}`}>
          {headerInfo.badge}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5">
        {/* Network controls (shown only when in network section) */}
        {activeTab.startsWith('net-') && (
          <>
            <button
              onClick={onOpenSubnetCalc}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition border border-slate-200"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Subnet Calc</span>
            </button>
            <button
              onClick={onOpenSecurity}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition border border-slate-200"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>Security</span>
            </button>
          </>
        )}

        <button
          onClick={onOpenAI}
          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold rounded-xl flex items-center space-x-1.5 transition shadow-xs"
        >
          <Bot className="w-4 h-4" />
          <span>AI Tutor Assistant</span>
        </button>

        {!user && (
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
