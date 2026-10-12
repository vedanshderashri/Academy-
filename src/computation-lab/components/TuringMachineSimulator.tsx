import React, { useState } from 'react';
import { Play, RotateCcw, Cpu, ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export const TuringMachineSimulator: React.FC = () => {
  const [tape, setTape] = useState<string[]>(['1', '0', '1', '1', 'B', 'B']);
  const [headIndex, setHeadIndex] = useState<number>(0);
  const [currentState, setCurrentState] = useState<string>('q0');
  const [preset, setPreset] = useState<'invert' | 'increment'>('invert');
  const [logs, setLogs] = useState<string[]>(['Initialized Turing Machine on Tape: [1, 0, 1, 1]']);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const handleReset = (selectedPreset = preset) => {
    if (selectedPreset === 'invert') {
      setTape(['1', '0', '1', '1', 'B', 'B']);
    } else {
      setTape(['1', '0', '1', 'B', 'B', 'B']);
    }
    setHeadIndex(0);
    setCurrentState('q0');
    setLogs([`Reset Turing Machine. Preset: ${selectedPreset}`]);
    setIsFinished(false);
  };

  const handleStep = () => {
    if (isFinished) return;

    const currentTape = [...tape];
    const symbol = currentTape[headIndex] || 'B';

    if (preset === 'invert') {
      // Invert 0 <-> 1 across tape until Blank 'B'
      if (symbol === '1') {
        currentTape[headIndex] = '0';
        const nextHead = headIndex + 1;
        setTape(currentTape);
        setHeadIndex(nextHead);
        setLogs((prev) => [...prev, `Step: Head at [${headIndex}] read '1' → Wrote '0', Moved RIGHT → state q0`]);
      } else if (symbol === '0') {
        currentTape[headIndex] = '1';
        const nextHead = headIndex + 1;
        setTape(currentTape);
        setHeadIndex(nextHead);
        setLogs((prev) => [...prev, `Step: Head at [${headIndex}] read '0' → Wrote '1', Moved RIGHT → state q0`]);
      } else if (symbol === 'B') {
        setCurrentState('q_accept');
        setIsFinished(true);
        setLogs((prev) => [...prev, `✓ Read Blank 'B' at head [${headIndex}]. Reached q_accept state! HALTED.`]);
      }
    } else {
      // Binary Incrementer preset (+1 to binary number)
      if (currentState === 'q0') {
        // Seek to end of string (Blank B)
        if (symbol !== 'B') {
          setHeadIndex((prev) => prev + 1);
          setLogs((prev) => [...prev, `Step: Seeking end of string. Read '${symbol}', Moved RIGHT`]);
        } else {
          // Move left to last digit
          setCurrentState('q1');
          setHeadIndex((prev) => prev - 1);
          setLogs((prev) => [...prev, `Step: Found Blank 'B'. Switched to q1 (Increment), Moved LEFT`]);
        }
      } else if (currentState === 'q1') {
        if (symbol === '1') {
          currentTape[headIndex] = '0';
          setTape(currentTape);
          setHeadIndex((prev) => prev - 1);
          setLogs((prev) => [...prev, `Step: Read '1' → Wrote '0' (Carry 1), Moved LEFT`]);
        } else if (symbol === '0') {
          currentTape[headIndex] = '1';
          setTape(currentTape);
          setCurrentState('q_accept');
          setIsFinished(true);
          setLogs((prev) => [...prev, `✓ Read '0' → Wrote '1' (No Carry). Reached q_accept! HALTED.`]);
        } else if (symbol === 'B') {
          currentTape[headIndex] = '1';
          setTape(currentTape);
          setCurrentState('q_accept');
          setIsFinished(true);
          setLogs((prev) => [...prev, `✓ Read Blank 'B' → Wrote '1'. Reached q_accept! HALTED.`]);
        }
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
              TURING MACHINE (TM) INFINITE TAPE SIMULATOR
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Simulate Type 0 Unrestricted Languages with Read/Write Head & Infinite Tape Memory
            </p>
          </div>

          <span className="bg-purple-100 text-purple-900 border border-purple-300 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            <span>Type 0 Turing Universal Computation</span>
          </span>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Select Turing Machine Program:</label>
            <select
              value={preset}
              onChange={(e) => {
                const val = e.target.value as 'invert' | 'increment';
                setPreset(val);
                handleReset(val);
              }}
              className="w-full bg-white border border-slate-300 font-bold text-xs rounded-xl p-2 focus:outline-none focus:border-purple-600"
            >
              <option value="invert">Binary String Inverter (0 ↔ 1)</option>
              <option value="increment">Binary Number Incrementer (+1 Adder)</option>
            </select>
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={() => handleReset()}
              className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Tape</span>
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleStep}
              disabled={isFinished}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isFinished ? 'Turing Machine Halted' : 'Step TM Transition'}</span>
            </button>
          </div>
        </div>

        {/* 1D Infinite Tape Visualization */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>TAPE ALPHABET: {'{0, 1, B}'}</span>
            <span className="text-cyan-400">CURRENT STATE: {currentState}</span>
          </div>

          {/* Tape Cells Grid */}
          <div className="flex items-center justify-center space-x-2 overflow-x-auto py-4">
            {tape.map((cell, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-2">
                {/* Visual Head Pointer Indicator */}
                <div className={`h-4 transition-all ${idx === headIndex ? 'opacity-100 scale-125' : 'opacity-0'}`}>
                  <span className="text-cyan-400 font-black text-xs">▼ HEAD</span>
                </div>

                {/* Tape Cell */}
                <div
                  className={`w-12 h-14 rounded-xl font-mono text-lg font-black flex items-center justify-center border-2 transition-all ${
                    idx === headIndex
                      ? 'bg-cyan-500 text-slate-950 border-white scale-110 shadow-lg'
                      : 'bg-slate-800 text-white border-slate-700'
                  }`}
                >
                  {cell}
                </div>

                {/* Index */}
                <span className="text-[10px] font-mono text-slate-500">{idx}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Halted Status Banner */}
        {isFinished && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-extrabold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Turing Machine Reached HALT / ACCEPT State (q_accept)! Computation Complete.</span>
            </div>
          </div>
        )}

        {/* Execution Log */}
        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl space-y-2 font-mono text-xs">
          <span className="font-bold text-cyan-400 block font-sans">Turing Transition Execution Log:</span>
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
