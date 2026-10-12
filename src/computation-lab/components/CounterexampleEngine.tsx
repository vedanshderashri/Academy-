import React, { useState } from 'react';
import { DFAModel } from '../core/types';
import { DFAEngine } from '../engine/automata/DFAEngine';
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

interface CounterexampleEngineProps {
  dfa: DFAModel;
}

export const CounterexampleEngine: React.FC<CounterexampleEngineProps> = ({ dfa }) => {
  const [selectedTarget, setSelectedTarget] = useState<string>('EVEN_ONES');
  const [verificationResult, setVerificationResult] = useState<{
    passed: boolean;
    counterexample?: string;
    expected?: boolean;
    studentResult?: boolean;
  } | null>(null);

  const targetPredicates: Record<string, { name: string; pred: (str: string) => boolean; desc: string }> = {
    EVEN_ONES: {
      name: 'Contains an EVEN number of 1s',
      pred: (str) => (str.split('1').length - 1) % 2 === 0,
      desc: 'Accepts strings with 0, 2, 4, 6... ones over Σ={0,1}',
    },
    ENDS_WITH_01: {
      name: 'Ends with pattern 01',
      pred: (str) => str.endsWith('01'),
      desc: 'Accepts strings ending in 01 over Σ={0,1}',
    },
    AT_LEAST_ONE_1: {
      name: 'Contains at least one 1',
      pred: (str) => str.includes('1'),
      desc: 'Accepts strings containing 1 or more ones over Σ={0,1}',
    },
  };

  const handleVerify = () => {
    const target = targetPredicates[selectedTarget];
    if (!target) return;

    const result = DFAEngine.findCounterexample(dfa, target.pred, 5);

    if (!result) {
      setVerificationResult({ passed: true });
    } else {
      setVerificationResult({
        passed: false,
        counterexample: result.counterexample,
        expected: result.expected,
        studentResult: result.studentResult,
      });
    }
  };

  const currentTarget = targetPredicates[selectedTarget];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 font-sans select-none shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Automated Counterexample Engine</h4>
          <p className="text-[11px] text-slate-500">
            Automated formal equivalence checker against target language predicate
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedTarget}
            onChange={(e) => {
              setSelectedTarget(e.target.value);
              setVerificationResult(null);
            }}
            className="bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="EVEN_ONES">Target 1: Even number of 1s</option>
            <option value="ENDS_WITH_01">Target 2: Ends with '01'</option>
            <option value="AT_LEAST_ONE_1">Target 3: At least one '1'</option>
          </select>

          <button
            onClick={handleVerify}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Verify Automaton</span>
          </button>
        </div>
      </div>

      {verificationResult && (
        <div>
          {verificationResult.passed ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Correct! Your DFA perfectly matches the target language requirements up to length 5.</span>
            </div>
          ) : (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 text-xs space-y-1 font-medium">
              <div className="flex items-center space-x-2 font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Counterexample Found! Machine logic mismatch:</span>
              </div>
              <div className="font-mono bg-white p-2 rounded-lg border border-rose-200 text-xs space-y-1">
                <div>
                  Counterexample String: <span className="font-extrabold text-cyan-800">'{verificationResult.counterexample}'</span>
                </div>
                <div>
                  Expected Result: <span className="font-bold">{verificationResult.expected ? 'ACCEPT' : 'REJECT'}</span>
                </div>
                <div>
                  Your Machine Result: <span className="font-bold text-rose-700">{verificationResult.studentResult ? 'ACCEPT' : 'REJECT'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
