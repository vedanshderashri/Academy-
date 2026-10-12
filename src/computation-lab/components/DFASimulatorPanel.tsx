import React, { useState, useEffect } from 'react';
import { DFAModel, DFASimulationStep } from '../core/types';
import { DFAEngine } from '../engine/automata/DFAEngine';
import { Play, Pause, SkipForward, RotateCcw, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface DFASimulatorPanelProps {
  dfa: DFAModel;
  onActiveStateChange?: (stateId: string | null, transitionId: string | null) => void;
}

export const DFASimulatorPanel: React.FC<DFASimulatorPanelProps> = ({ dfa, onActiveStateChange }) => {
  const [inputString, setInputString] = useState<string>('00101');
  const [steps, setSteps] = useState<DFASimulationStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(800); // ms per step

  // Re-run simulation when input or DFA model changes
  useEffect(() => {
    try {
      const engine = new DFAEngine();
      engine.loadModel(dfa);
      engine.reset(inputString);
      const allSteps = engine.run();
      setSteps(allSteps);
      setCurrentStepIdx(0);
      setIsPlaying(false);

      if (onActiveStateChange && allSteps[0]) {
        onActiveStateChange(allSteps[0].currentStateId, allSteps[0].transitionTakenId);
      }
    } catch (e) {
      console.error(e);
    }
  }, [dfa, inputString]);

  // Handle playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < steps.length - 1) {
          const nextIdx = prev + 1;
          if (onActiveStateChange && steps[nextIdx]) {
            onActiveStateChange(steps[nextIdx].currentStateId, steps[nextIdx].transitionTakenId);
          }
          return nextIdx;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, speed);

    return () => clearInterval(timer);
  }, [isPlaying, steps, speed, onActiveStateChange]);

  const handleStep = (stepIdx: number) => {
    if (stepIdx >= 0 && stepIdx < steps.length) {
      setCurrentStepIdx(stepIdx);
      if (onActiveStateChange && steps[stepIdx]) {
        onActiveStateChange(steps[stepIdx].currentStateId, steps[stepIdx].transitionTakenId);
      }
    }
  };

  const currentStep = steps[currentStepIdx];
  const finalStep = steps[steps.length - 1];

  return (
    <div className="bg-white border-t border-slate-200 p-4 space-y-4 font-sans select-none">
      {/* Input String Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <span className="text-xs font-bold text-slate-700">Input String $w$:</span>
          <input
            type="text"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            placeholder="e.g. 00101 or ε"
            className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-cyan-600"
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              handleStep(0);
              setIsPlaying(false);
            }}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            title="Reset to Start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={() => {
              if (currentStepIdx < steps.length - 1) handleStep(currentStepIdx + 1);
            }}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            title="Step Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <select
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
            className="bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg px-2 py-1.5"
          >
            <option value={1200}>0.5x Speed</option>
            <option value={800}>1.0x Speed</option>
            <option value={400}>2.0x Speed</option>
          </select>
        </div>
      </div>

      {/* Execution Step Details & Result Banner */}
      {currentStep && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Current State</span>
            <span className="text-sm font-extrabold text-slate-900 font-mono">{currentStep.currentStateName}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Remaining Input</span>
            <span className="text-sm font-extrabold text-cyan-700 font-mono">
              {currentStep.remainingInput || 'ε (Empty)'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Evaluation Result</span>
              <span className="text-xs font-black">
                {finalStep?.isAccepted === true
                  ? 'ACCEPTED (L(M))'
                  : finalStep?.isAccepted === false
                  ? 'REJECTED'
                  : 'Evaluating...'}
              </span>
            </div>
            {finalStep?.isAccepted === true ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : finalStep?.isAccepted === false ? (
              <XCircle className="w-6 h-6 text-rose-600" />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
