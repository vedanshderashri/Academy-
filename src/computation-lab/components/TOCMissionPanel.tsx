import React, { useState } from 'react';
import { DFAModel } from '../core/types';
import { DFAEngine } from '../engine/automata/DFAEngine';
import {
  Target,
  CheckCircle2,
  XCircle,
  Play,
  Lightbulb,
  Award,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Cpu,
  RefreshCw,
} from 'lucide-react';

export interface TOCMission {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  topic: string;
  description: string;
  objective: string;
  hints: string[];
  testCases: { input: string; expected: boolean }[];
  presetDFA: DFAModel;
}

export const TOC_MISSIONS: TOCMission[] = [
  {
    id: 'toc-m1',
    title: 'Mission 1: The Binary Ending Challenge',
    level: 'Beginner',
    topic: 'Finite Automata (DFA)',
    description: 'Construct a Deterministic Finite Automaton (DFA) over Σ = {0, 1} that accepts all binary strings ending with "01".',
    objective: 'Ensure string "01" transitions to an accepting state, while "00" or "10" transition away.',
    hints: [
      'State q0: Initial state (No matching suffix yet)',
      'State q1: Seen trailing "0"',
      'State q2: Seen trailing "01" (Accepting state)',
      'From q2, reading "0" moves back to q1 (since trailing symbol is now "0").',
    ],
    testCases: [
      { input: '01', expected: true },
      { input: '101', expected: true },
      { input: '0001', expected: true },
      { input: '0', expected: false },
      { input: '10', expected: false },
      { input: '111', expected: false },
    ],
    presetDFA: {
      id: 'dfa-m1',
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
    },
  },
  {
    id: 'toc-m2',
    title: 'Mission 2: Even Number of 0s',
    level: 'Intermediate',
    topic: 'Regular Languages',
    description: 'Design an automaton over Σ = {0, 1} that accepts strings containing an EVEN number of "0" symbols (including empty string ε).',
    objective: 'Create 2 states: one for even parity of 0s and one for odd parity of 0s.',
    hints: [
      'q0 (Start & Accepting): Even number of 0s',
      'q1 (Non-accepting): Odd number of 0s',
      'Reading "0" toggles between q0 and q1.',
      'Reading "1" keeps the state unchanged (self-loop).',
    ],
    testCases: [
      { input: '', expected: true },
      { input: '1', expected: true },
      { input: '00', expected: true },
      { input: '1010', expected: true },
      { input: '0', expected: false },
      { input: '000', expected: false },
    ],
    presetDFA: {
      id: 'dfa-m2',
      name: 'DFA: Even 0s',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', name: 'q0 (Even)', isStart: true, isAccepting: true, x: 180, y: 180 },
        { id: 'q1', name: 'q1 (Odd)', isStart: false, isAccepting: false, x: 380, y: 180 },
      ],
      transitions: [
        { id: 't1', fromStateId: 'q0', toStateId: 'q1', symbol: '0' },
        { id: 't2', fromStateId: 'q0', toStateId: 'q0', symbol: '1' },
        { id: 't3', fromStateId: 'q1', toStateId: 'q0', symbol: '0' },
        { id: 't4', fromStateId: 'q1', toStateId: 'q1', symbol: '1' },
      ],
      startStateId: 'q0',
    },
  },
  {
    id: 'toc-m3',
    title: 'Mission 3: Substring "101" Detector',
    level: 'Advanced',
    topic: 'Pattern Recognition',
    description: 'Construct a DFA that detects if a binary string contains "101" anywhere as a contiguous substring.',
    objective: 'Once "101" is matched, state q3 must remain in an accepting trap state.',
    hints: [
      'q0: Start state',
      'q1: Saw "1"',
      'q2: Saw "10"',
      'q3: Saw "101" (Accepting trap state, self-loops on 0 and 1)',
    ],
    testCases: [
      { input: '101', expected: true },
      { input: '01010', expected: true },
      { input: '11011', expected: true },
      { input: '100', expected: false },
      { input: '0110', expected: false },
      { input: '0000', expected: false },
    ],
    presetDFA: {
      id: 'dfa-m3',
      name: 'DFA: Substring 101',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', name: 'q0', isStart: true, isAccepting: false, x: 120, y: 180 },
        { id: 'q1', name: 'q1', isStart: false, isAccepting: false, x: 260, y: 180 },
        { id: 'q2', name: 'q2', isStart: false, isAccepting: false, x: 400, y: 180 },
        { id: 'q3', name: 'q3', isStart: false, isAccepting: true, x: 540, y: 180 },
      ],
      transitions: [
        { id: 't1', fromStateId: 'q0', toStateId: 'q1', symbol: '1' },
        { id: 't2', fromStateId: 'q0', toStateId: 'q0', symbol: '0' },
        { id: 't3', fromStateId: 'q1', toStateId: 'q2', symbol: '0' },
        { id: 't4', fromStateId: 'q1', toStateId: 'q1', symbol: '1' },
        { id: 't5', fromStateId: 'q2', toStateId: 'q3', symbol: '1' },
        { id: 't6', fromStateId: 'q2', toStateId: 'q0', symbol: '0' },
        { id: 't7', fromStateId: 'q3', toStateId: 'q3', symbol: '0' },
        { id: 't8', fromStateId: 'q3', toStateId: 'q3', symbol: '1' },
      ],
      startStateId: 'q0',
    },
  },
];

interface TOCMissionPanelProps {
  onLoadMissionPreset?: (preset: DFAModel) => void;
  onMissionCompleted?: (missionId: string) => void;
}

export const TOCMissionPanel: React.FC<TOCMissionPanelProps> = ({
  onLoadMissionPreset,
  onMissionCompleted,
}) => {
  const [selectedMission, setSelectedMission] = useState<TOCMission>(TOC_MISSIONS[0]);
  const [showHintIdx, setShowHintIdx] = useState<number>(0);
  const [testResults, setTestResults] = useState<{ input: string; expected: boolean; actual: boolean; passed: boolean }[] | null>(null);
  const [allPassed, setAllPassed] = useState<boolean>(false);

  const handleRunTestSuite = () => {
    const engine = new DFAEngine();
    engine.loadModel(selectedMission.presetDFA);

    const results = selectedMission.testCases.map((tc) => {
      const actual = engine.evaluateString(tc.input);
      return {
        input: tc.input || 'ε',
        expected: tc.expected,
        actual,
        passed: actual === tc.expected,
      };
    });

    const passedAll = results.every((r) => r.passed);
    setTestResults(results);
    setAllPassed(passedAll);

    if (passedAll && onMissionCompleted) {
      onMissionCompleted(selectedMission.id);
    }
  };

  return (
    <div className="w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col h-full font-sans select-none text-slate-900 flex-shrink-0 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <h2 className="font-extrabold text-sm tracking-tight">TOC LAB MISSIONS & PUZZLES</h2>
        </div>
        <span className="bg-slate-800 text-cyan-400 font-mono font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-slate-700">
          {TOC_MISSIONS.length} Guided Labs
        </span>
      </div>

      {/* Missions List Dropdown / Tabs */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          Select Active Lab Challenge:
        </label>
        <select
          value={selectedMission.id}
          onChange={(e) => {
            const found = TOC_MISSIONS.find((m) => m.id === e.target.value);
            if (found) {
              setSelectedMission(found);
              setTestResults(null);
              setAllPassed(false);
              setShowHintIdx(0);
              if (onLoadMissionPreset) onLoadMissionPreset(found.presetDFA);
            }
          }}
          className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-2 font-bold text-xs focus:outline-none focus:border-cyan-600 shadow-xs"
        >
          {TOC_MISSIONS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title} ({m.level})
            </option>
          ))}
        </select>
      </div>

      {/* Mission Body Details */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title & Badge */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300">
              {selectedMission.level} • {selectedMission.topic}
            </span>
          </div>
          <h3 className="font-extrabold text-base text-slate-900 mt-2">{selectedMission.title}</h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
            {selectedMission.description}
          </p>
        </div>

        {/* Learning Objective Box */}
        <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-indigo-950 text-xs font-semibold space-y-1">
          <span className="font-extrabold text-indigo-900 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Learning Objective:</span>
          </span>
          <p>{selectedMission.objective}</p>
        </div>

        {/* Load Preset Button */}
        <button
          onClick={() => {
            if (onLoadMissionPreset) onLoadMissionPreset(selectedMission.presetDFA);
          }}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl font-extrabold text-xs text-slate-800 flex items-center justify-center gap-1.5 transition"
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-600" />
          <span>Load Challenge Automaton onto Canvas</span>
        </button>

        {/* Hints Section */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-amber-900 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>Guided Hint ({showHintIdx + 1}/{selectedMission.hints.length})</span>
            </span>
            {showHintIdx < selectedMission.hints.length - 1 && (
              <button
                onClick={() => setShowHintIdx((prev) => prev + 1)}
                className="text-[10px] font-bold text-amber-800 hover:underline flex items-center gap-0.5"
              >
                Next Hint <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-xs text-amber-900 font-medium">{selectedMission.hints[showHintIdx]}</p>
        </div>

        {/* Test Suite Section */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase">Automated Test Suite:</h4>
            <button
              onClick={handleRunTestSuite}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run Test Suite</span>
            </button>
          </div>

          {testResults ? (
            <div className="space-y-2">
              <div
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                  allPassed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <span>{allPassed ? '✓ All Test Cases Passed!' : '✖ Test Failures Detected'}</span>
                {allPassed && <Award className="w-4 h-4 text-emerald-600" />}
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                {testResults.map((tr, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border flex items-center justify-between ${
                      tr.passed ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-rose-50/60 border-rose-200 text-rose-900'
                    }`}
                  >
                    <span>
                      Input: "<span className="font-bold">{tr.input}</span>"
                    </span>
                    <span className="flex items-center gap-1 font-bold text-[11px]">
                      {tr.passed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>PASS ({tr.actual ? 'Accepted' : 'Rejected'})</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>FAIL (Got {tr.actual ? 'Accepted' : 'Rejected'})</span>
                        </>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 font-medium">
              Click 'Run Test Suite' to verify your automaton against test cases.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
