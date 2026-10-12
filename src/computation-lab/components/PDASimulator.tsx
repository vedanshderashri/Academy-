import React, { useState } from 'react';
import { Play, RotateCcw, Layers, ArrowRight, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export const PDASimulator: React.FC = () => {
  const [inputString, setInputString] = useState<string>('aabb');
  const [stack, setStack] = useState<string[]>(['Z0']);
  const [currentState, setCurrentState] = useState<string>('q0');
  const [inputIndex, setInputIndex] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>(['Initialized PDA with Stack [Z0]']);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isAccepted, setIsAccepted] = useState<boolean>(false);

  const handleReset = () => {
    setStack(['Z0']);
    setCurrentState('q0');
    setInputIndex(0);
    setLogs([`Reset PDA. Input: "${inputString}", Stack: [Z0]`]);
    setIsFinished(false);
    setIsAccepted(false);
  };

  const handleStep = () => {
    if (isFinished) return;

    if (inputIndex >= inputString.length) {
      // End of input processing
      if (stack.length === 1 && stack[0] === 'Z0') {
        setIsAccepted(true);
        setLogs((prev) => [...prev, '✓ Input fully consumed & Stack returned to initial state [Z0]. STRING ACCEPTED!']);
      } else {
        setIsAccepted(false);
        setLogs((prev) => [...prev, `✖ End of input reached but stack has remaining symbols [${stack.join(', ')}]. REJECTED.`]);
      }
      setIsFinished(true);
      return;
    }

    const char = inputString[inputIndex];

    if (currentState === 'q0') {
      if (char === 'a') {
        // Push 'A' to stack
        const nextStack = [...stack, 'A'];
        setStack(nextStack);
        setInputIndex((prev) => prev + 1);
        setLogs((prev) => [...prev, `Step ${inputIndex + 1}: Read 'a' in q0 → PUSH 'A' to Stack [${nextStack.join(', ')}]`]);
      } else if (char === 'b') {
        // Transition to q1 and pop 'A'
        if (stack[stack.length - 1] === 'A') {
          const nextStack = stack.slice(0, -1);
          setStack(nextStack);
          setCurrentState('q1');
          setInputIndex((prev) => prev + 1);
          setLogs((prev) => [...prev, `Step ${inputIndex + 1}: Read 'b' → Transition to q1, POP 'A' from Stack [${nextStack.join(', ')}]`]);
        } else {
          setIsAccepted(false);
          setIsFinished(true);
          setLogs((prev) => [...prev, `✖ Read 'b' but stack top is not 'A'. REJECTED.`]);
        }
      } else {
        setIsAccepted(false);
        setIsFinished(true);
        setLogs((prev) => [...prev, `✖ Invalid symbol '${char}'. REJECTED.`]);
      }
    } else if (currentState === 'q1') {
      if (char === 'b') {
        if (stack[stack.length - 1] === 'A') {
          const nextStack = stack.slice(0, -1);
          setStack(nextStack);
          setInputIndex((prev) => prev + 1);
          setLogs((prev) => [...prev, `Step ${inputIndex + 1}: Read 'b' in q1 → POP 'A' from Stack [${nextStack.join(', ')}]`]);
        } else {
          setIsAccepted(false);
          setIsFinished(true);
          setLogs((prev) => [...prev, `✖ Read 'b' but stack is empty/invalid. REJECTED.`]);
        }
      } else {
        setIsAccepted(false);
        setIsFinished(true);
        setLogs((prev) => [...prev, `✖ Unexpected symbol '${char}' in state q1. REJECTED.`]);
      }
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-[#fafafa] space-y-6 select-none font-sans text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 uppercase">
              PUSHDOWN AUTOMATA (PDA) & STACK SIMULATOR
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Simulate Context-Free Languages (CFLs) with LIFO Stack Memory: L = {'{'}aⁿ bⁿ | n ≥ 1{'}'}
            </p>
          </div>

          <span className="bg-purple-100 text-purple-900 border border-purple-300 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Type 2 Context-Free Language</span>
          </span>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Input String to Process:</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputString}
                onChange={(e) => setInputString(e.target.value.toLowerCase())}
                placeholder="e.g. aabb or aaabbb"
                className="flex-1 bg-white border border-slate-300 font-mono text-xs rounded-xl p-2 font-bold focus:outline-none focus:border-purple-600"
              />
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleStep}
              disabled={isFinished}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isFinished ? 'Execution Complete' : 'Step Single Transition'}</span>
            </button>
          </div>
        </div>

        {/* Visualization Grid: Input Tape + Visual Stack + Current State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Input Tape */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-extrabold text-slate-800 block">1. Input String Tape:</span>
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
              {inputString.split('').map((char, idx) => (
                <div
                  key={idx}
                  className={`w-10 h-10 rounded-xl font-mono text-sm font-black flex items-center justify-center border transition-all ${
                    idx === inputIndex
                      ? 'bg-purple-600 text-white border-purple-700 scale-110 shadow-md animate-bounce'
                      : idx < inputIndex
                      ? 'bg-slate-200 text-slate-500 border-slate-300'
                      : 'bg-white text-slate-900 border-slate-200'
                  }`}
                >
                  {char}
                </div>
              ))}
              {inputString.length === 0 && (
                <span className="text-xs text-slate-400 italic">Empty string ε</span>
              )}
            </div>
          </div>

          {/* Current State Machine Status */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-extrabold text-slate-800 block">2. Control State:</span>
            <div className="flex items-center space-x-4 pt-1">
              <div
                className={`p-3 rounded-2xl border font-bold text-xs flex items-center gap-2 ${
                  currentState === 'q0'
                    ? 'bg-purple-100 border-purple-400 text-purple-950 font-black'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span>q0 (Reading 'a's)</span>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400" />

              <div
                className={`p-3 rounded-2xl border font-bold text-xs flex items-center gap-2 ${
                  currentState === 'q1'
                    ? 'bg-purple-100 border-purple-400 text-purple-950 font-black'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span>q1 (Popping 'b's)</span>
              </div>
            </div>
          </div>

          {/* Visual Stack Memory Container */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col items-center">
            <span className="text-xs font-extrabold text-slate-800 block w-full text-left">
              3. LIFO Stack Memory:
            </span>
            <div className="w-28 bg-white border-2 border-slate-400 border-t-0 rounded-b-xl p-2 flex flex-col-reverse items-center gap-1.5 min-h-[140px]">
              {stack.map((sym, idx) => (
                <div
                  key={idx}
                  className={`w-full py-1.5 rounded-lg font-mono text-xs font-black text-center border transition-all ${
                    sym === 'Z0'
                      ? 'bg-slate-800 text-white border-slate-900'
                      : 'bg-purple-500 text-white border-purple-600 shadow-sm'
                  }`}
                >
                  {sym} {idx === stack.length - 1 ? '(TOP)' : ''}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Execution Result Banner */}
        {isFinished && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs font-extrabold ${
              isAccepted
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-center space-x-2">
              {isAccepted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600" />
              )}
              <span>
                {isAccepted
                  ? `SUCCESS: String "${inputString}" is in Context-Free Language L = {aⁿbⁿ}`
                  : `REJECTED: String "${inputString}" violates Context-Free Grammar L = {aⁿbⁿ}`}
              </span>
            </div>
          </div>
        )}

        {/* Step Execution Log */}
        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl space-y-2 font-mono text-xs">
          <span className="font-bold text-cyan-400 block font-sans">Execution Trace Log:</span>
          <div className="max-h-36 overflow-y-auto space-y-1">
            {logs.map((log, idx) => (
              <div key={idx} className="text-[11px]">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
