import React, { useState } from 'react';
import { DFAState, SymbolChar } from '../core/types';
import {
  Flag,
  CheckCircle2,
  Repeat,
  Plus,
  Edit2,
  Trash2,
  Info,
  X,
  ArrowRight,
} from 'lucide-react';

interface StateHitmenuProps {
  state: DFAState;
  allStates: DFAState[];
  alphabet: SymbolChar[];
  onUpdateState: (updated: DFAState) => void;
  onDeleteState: (stateId: string) => void;
  onAddTransition: (fromId: string, toId: string, symbol: SymbolChar) => void;
  onClose: () => void;
}

export const StateHitmenu: React.FC<StateHitmenuProps> = ({
  state,
  allStates,
  alphabet,
  onUpdateState,
  onDeleteState,
  onAddTransition,
  onClose,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(state.name);
  const [targetStateId, setTargetStateId] = useState<string>(allStates[0]?.id || state.id);
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolChar>(alphabet[0] || '0');
  const [showInfo, setShowInfo] = useState(false);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateState({ ...state, name: nameInput.trim() });
      setIsEditingName(false);
    }
  };

  const handleAddQuickTransition = () => {
    onAddTransition(state.id, targetStateId, selectedSymbol);
  };

  return (
    <div
      className="absolute z-30 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl p-3 w-64 text-slate-900 font-sans text-xs animate-in fade-in zoom-in-95 duration-150"
      style={{
        left: `${Math.min(Math.max(state.x + 35, 10), 450)}px`,
        top: `${Math.min(Math.max(state.y - 40, 10), 380)}px`,
      }}
    >
      {/* Hitmenu Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-slate-900 text-cyan-400 font-black flex items-center justify-center text-xs">
            {state.name}
          </div>
          {isEditingName ? (
            <div className="flex items-center space-x-1">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="w-20 px-1.5 py-0.5 border border-cyan-500 rounded text-xs font-bold focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="px-1.5 py-0.5 bg-cyan-600 text-white font-bold rounded text-[10px]"
              >
                Save
              </button>
            </div>
          ) : (
            <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1">
              <span>{state.name}</span>
              <button
                onClick={() => setIsEditingName(true)}
                className="text-slate-400 hover:text-slate-700"
                title="Rename State"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Primary State Toggles */}
      <div className="grid grid-cols-2 gap-1.5 mb-2.5">
        <button
          onClick={() => onUpdateState({ ...state, isStart: !state.isStart })}
          className={`px-2.5 py-1.5 rounded-xl font-extrabold text-left transition flex items-center gap-1.5 border ${
            state.isStart
              ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <Flag className="w-3.5 h-3.5 text-indigo-600" />
          <span>{state.isStart ? 'Start State ✓' : 'Set as Start'}</span>
        </button>

        <button
          onClick={() => onUpdateState({ ...state, isAccepting: !state.isAccepting })}
          className={`px-2.5 py-1.5 rounded-xl font-extrabold text-left transition flex items-center gap-1.5 border ${
            state.isAccepting
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{state.isAccepting ? 'Accepting ✓' : 'Set Accepting'}</span>
        </button>
      </div>

      {/* Quick Add Transition Row */}
      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1.5 mb-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          Quick Add Transition
        </span>
        <div className="flex items-center space-x-1.5">
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg p-1 text-xs font-bold focus:outline-none"
          >
            {alphabet.map((sym) => (
              <option key={sym} value={sym}>
                on '{sym}'
              </option>
            ))}
          </select>

          <span className="text-slate-400 font-bold">→</span>

          <select
            value={targetStateId}
            onChange={(e) => setTargetStateId(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg p-1 text-xs font-bold focus:outline-none flex-1"
          >
            {allStates.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.id === state.id ? '(Self)' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddQuickTransition}
            className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition"
            title="Add Transition"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info & Action Buttons */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          <Info className="w-3.5 h-3.5 text-cyan-600" />
          <span>{showInfo ? 'Hide Info' : 'State Info'}</span>
        </button>

        <button
          onClick={() => onDeleteState(state.id)}
          className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete State</span>
        </button>
      </div>

      {/* State Educational Role Description */}
      {showInfo && (
        <div className="mt-2 p-2 bg-cyan-50/80 border border-cyan-200 rounded-xl text-[11px] text-cyan-950 font-medium space-y-1">
          <div className="font-extrabold text-cyan-900">Automaton State Role:</div>
          <p>
            {state.isStart && state.isAccepting
              ? 'Initial accepting state. Accepts the empty string (ε).'
              : state.isStart
              ? 'Starting point of computation. The machine begins execution here.'
              : state.isAccepting
              ? 'Accepting state. If processing ends here, the string is accepted.'
              : 'Intermediate state. Processes input symbols and directs control flow.'}
          </p>
        </div>
      )}
    </div>
  );
};
