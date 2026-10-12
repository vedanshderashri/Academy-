import React, { useState } from 'react';
import { DFAModel, DFAState, DFATransition, NFAModel } from '../core/types';
import { AutomataCanvas } from './AutomataCanvas';
import { DFASimulatorPanel } from './DFASimulatorPanel';
import { FormalLanguageLab } from './FormalLanguageLab';
import { CounterexampleEngine } from './CounterexampleEngine';
import { PDASimulator } from './PDASimulator';
import { TuringMachineSimulator } from './TuringMachineSimulator';
import { NFAEngine } from '../engine/automata/NFAEngine';
import { Cpu, Layers, GitMerge, Award, Sparkles, RefreshCw, Zap, Box } from 'lucide-react';

interface ComputationLabViewProps {
  customDFA?: DFAModel;
}

export const ComputationLabView: React.FC<ComputationLabViewProps> = ({ customDFA }) => {
  const [activeTab, setActiveTab] = useState<'dfa' | 'pda' | 'turing' | 'languages' | 'nfa_conversion' | 'chomsky'>('dfa');

  // Initial Sample DFA
  const [dfaModel, setDfaModel] = useState<DFAModel>(
    customDFA || {
      id: 'dfa-sample-1',
      name: 'DFA: Ends with 01',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', name: 'q0', isStart: true, isAccepting: false, x: 140, y: 180 },
        { id: 'q1', name: 'q1', isStart: false, isAccepting: false, x: 300, y: 180 },
        { id: 'q2', name: 'q2', isStart: false, isAccepting: true, x: 460, y: 180 },
      ],
      transitions: [
        { id: 't1', fromStateId: 'q0', toStateId: 'q1', symbol: '0' },
        { id: 't2', fromStateId: 'q0', toStateId: 'q0', symbol: '1' },
        { id: 't3', fromStateId: 'q1', toStateId: 'q1', symbol: '0' },
        { id: 't4', fromStateId: 'q1', toStateId: 'q2', symbol: '1' },
        { id: 't5', fromStateId: 'q2', toStateId: 'q1', symbol: '0' },
        { id: 't6', fromStateId: 'q2', toStateId: 'q0', symbol: '1' },
      ],
      startStateId: 'q0',
    }
  );

  // Sync customDFA if provided from TOC Missions
  React.useEffect(() => {
    if (customDFA) {
      setDfaModel(customDFA);
    }
  }, [customDFA]);

  // Sample NFA for Subset Construction NFA -> DFA
  const [sampleNFA, setSampleNFA] = useState<NFAModel>({
    id: 'nfa-sample-1',
    name: 'NFA: Contains 01',
    alphabet: ['0', '1', 'ε'],
    states: [
      { id: 'nq0', name: 'q0', isStart: true, isAccepting: false, x: 120, y: 150 },
      { id: 'nq1', name: 'q1', isStart: false, isAccepting: false, x: 280, y: 150 },
      { id: 'nq2', name: 'q2', isStart: false, isAccepting: true, x: 440, y: 150 },
    ],
    transitions: [
      { id: 'nt1', fromStateId: 'nq0', toStateId: 'nq0', symbol: '0' },
      { id: 'nt2', fromStateId: 'nq0', toStateId: 'nq0', symbol: '1' },
      { id: 'nt3', fromStateId: 'nq0', toStateId: 'nq1', symbol: '0' },
      { id: 'nt4', fromStateId: 'nq1', toStateId: 'nq2', symbol: '1' },
    ],
    startStateId: 'nq0',
  });

  const [convertedDFA, setConvertedDFA] = useState<DFAModel | null>(null);

  // Active Simulation Highlights
  const [activeStateId, setActiveStateId] = useState<string | null>(null);
  const [activeTransitionId, setActiveTransitionId] = useState<string | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);

  // State mutation handlers
  const handleAddState = (x: number, y: number) => {
    const newId = `q${dfaModel.states.length}`;
    const newState: DFAState = {
      id: newId,
      name: newId,
      isStart: dfaModel.states.length === 0,
      isAccepting: false,
      x,
      y,
    };
    setDfaModel({ ...dfaModel, states: [...dfaModel.states, newState] });
  };

  const handleUpdateState = (updated: DFAState) => {
    const nextStates = dfaModel.states.map((s) => (s.id === updated.id ? updated : s));
    setDfaModel({ ...dfaModel, states: nextStates });
  };

  const handleDeleteState = (stateId: string) => {
    const nextStates = dfaModel.states.filter((s) => s.id !== stateId);
    const nextTransitions = dfaModel.transitions.filter(
      (t) => t.fromStateId !== stateId && t.toStateId !== stateId
    );
    setDfaModel({ ...dfaModel, states: nextStates, transitions: nextTransitions });
    if (selectedStateId === stateId) setSelectedStateId(null);
  };

  const handleAddTransition = (fromId: string, toId: string, symbol: string) => {
    const newTrans: DFATransition = {
      id: `t-${Date.now()}`,
      fromStateId: fromId,
      toStateId: toId,
      symbol,
    };
    setDfaModel({ ...dfaModel, transitions: [...dfaModel.transitions, newTrans] });
  };

  const handleConvertNFAToDFA = () => {
    try {
      const dfa = NFAEngine.convertNFAtoDFA(sampleNFA);
      setConvertedDFA(dfa);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full h-full bg-[#fefefe] flex flex-col font-sans select-none overflow-hidden text-slate-900">
      {/* Top Computation Lab Module Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-[#18181b] text-white flex items-center justify-center font-black text-sm">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900">COMPUTATION LAB WORKBENCHES</h2>
            <p className="text-[11px] font-semibold text-slate-500">
              Interactive Theory of Computation (TOC) Simulation, Visualization & Verification Platform
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dfa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'dfa' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>DFA Automata Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('pda')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'pda' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-purple-400" />
            <span>PDA Stack Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('turing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'turing' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Turing Machine Tape</span>
          </button>

          <button
            onClick={() => setActiveTab('languages')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'languages' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Formal Languages</span>
          </button>

          <button
            onClick={() => setActiveTab('nfa_conversion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'nfa_conversion' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5 text-sky-400" />
            <span>NFA → DFA Subset</span>
          </button>

          <button
            onClick={() => setActiveTab('chomsky')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'chomsky' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Chomsky Hierarchy</span>
          </button>
        </div>
      </div>

      {/* Main Mode Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'dfa' ? (
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Upper Section: Interactive Graph Canvas Editor */}
            <div className="min-h-[480px] h-[520px] relative w-full flex-shrink-0">
              <AutomataCanvas
                states={dfaModel.states}
                transitions={dfaModel.transitions}
                alphabet={dfaModel.alphabet}
                activeStateId={activeStateId}
                activeTransitionId={activeTransitionId}
                onAddState={handleAddState}
                onUpdateState={handleUpdateState}
                onDeleteState={handleDeleteState}
                onAddTransition={handleAddTransition}
                onDeleteTransition={(id) => {
                  setDfaModel({ ...dfaModel, transitions: dfaModel.transitions.filter((t) => t.id !== id) });
                }}
                onSelectState={setSelectedStateId}
                selectedStateId={selectedStateId}
              />
            </div>

            {/* Lower Section: Verification & Step Animator Controls */}
            <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-200 space-y-4 flex-shrink-0">
              <CounterexampleEngine dfa={dfaModel} />

              <DFASimulatorPanel
                dfa={dfaModel}
                onActiveStateChange={(stateId, transId) => {
                  setActiveStateId(stateId);
                  setActiveTransitionId(transId);
                }}
              />
            </div>
          </div>
        ) : activeTab === 'pda' ? (
          <PDASimulator />
        ) : activeTab === 'turing' ? (
          <TuringMachineSimulator />
        ) : activeTab === 'languages' ? (
          <FormalLanguageLab />
        ) : activeTab === 'nfa_conversion' ? (
          <div className="flex-1 p-6 overflow-y-auto bg-[#fafafa] space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">SUBSET CONSTRUCTION: NFA → DFA CONVERSION</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Convert non-deterministic automata with ε-closures into equivalent deterministic state machines
                  </p>
                </div>

                <button
                  onClick={handleConvertNFAToDFA}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Execute Subset Construction</span>
                </button>
              </div>

              {convertedDFA ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs font-bold">
                    ✓ Subset construction completed successfully! Generated equivalent DFA with {convertedDFA.states.length} states.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <span className="font-bold text-xs text-slate-900 block">Generated DFA States (Subsets):</span>
                      <div className="space-y-1 font-mono text-xs">
                        {convertedDFA.states.map((s) => (
                          <div key={s.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                            <span>{s.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100">
                              {s.isStart ? 'START' : ''} {s.isAccepting ? 'ACCEPTING' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <span className="font-bold text-xs text-slate-900 block">DFA Transition Table:</span>
                      <div className="space-y-1 font-mono text-xs">
                        {convertedDFA.transitions.map((t) => (
                          <div key={t.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                            <span>{t.fromStateId} --({t.symbol})--&gt; {t.toStateId}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Click 'Execute Subset Construction' to transform sample NFA into DFA.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto bg-[#fafafa] space-y-6">
            {/* Chomsky Hierarchy Matrix */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">THE CHOMSKY HIERARCHY OF FORMAL LANGUAGES</h3>
              <p className="text-xs text-slate-500 font-medium">
                Classification of computational power, formal languages, grammars, and operational automata
              </p>

              <div className="space-y-3">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                  <h4 className="font-extrabold text-sm text-amber-900">Type 3: Regular Languages</h4>
                  <p className="text-xs text-amber-800">Machine: Finite Automata (DFA / NFA) • Grammar: Regular Grammar • Memory: Finite</p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                  <h4 className="font-extrabold text-sm text-emerald-900">Type 2: Context-Free Languages</h4>
                  <p className="text-xs text-emerald-800">Machine: Pushdown Automata (PDA) • Grammar: Context-Free Grammar (CFG) • Memory: Stack</p>
                </div>

                <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl space-y-1">
                  <h4 className="font-extrabold text-sm text-cyan-900">Type 1: Context-Sensitive Languages</h4>
                  <p className="text-xs text-cyan-800">Machine: Linear Bounded Automaton (LBA) • Grammar: Context-Sensitive Grammar • Memory: Bounded Tape</p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-1">
                  <h4 className="font-extrabold text-sm text-purple-900">Type 0: Recursively Enumerable Languages</h4>
                  <p className="text-xs text-purple-800">Machine: Turing Machine (TM) • Grammar: Unrestricted Grammar • Memory: Unbounded Infinite Tape</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

