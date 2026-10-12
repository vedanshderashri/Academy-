import React, { useState } from 'react';
import { StringOps } from '../engine/formal-language/StringOps';
import { LanguageEngine } from '../engine/formal-language/LanguageEngine';
import { BookOpen, Sparkles, Layers, ArrowRight } from 'lucide-react';

export const FormalLanguageLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'strings' | 'languages'>('strings');

  // String Operations State
  const [strW1, setStrW1] = useState<string>('010');
  const [strW2, setStrW2] = useState<string>('11');
  const [powerK, setPowerK] = useState<number>(3);

  // Language Operations State
  const [l1Input, setL1Input] = useState<string>('0, 01, 10');
  const [l2Input, setL2Input] = useState<string>('01, 11, 100');

  const l1Array = l1Input.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
  const l2Array = l2Input.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

  const prefixes = StringOps.getPrefixes(strW1);
  const suffixes = StringOps.getSuffixes(strW1);
  const substrings = StringOps.getSubstrings(strW1);
  const reversed = StringOps.reverse(strW1);
  const concat = StringOps.concatenate(strW1, strW2);
  const powered = StringOps.power(strW1, powerK);
  const isSubseq = StringOps.isSubsequence(strW2, strW1);

  // Language Results
  const unionRes = LanguageEngine.union(l1Array, l2Array);
  const interRes = LanguageEngine.intersection(l1Array, l2Array);
  const diffRes = LanguageEngine.difference(l1Array, l2Array);
  const concatRes = LanguageEngine.concatenation(l1Array, l2Array);
  const starRes = LanguageEngine.kleeneStar(l1Array, 3);
  const plusRes = LanguageEngine.kleenePlus(l1Array, 3);
  const revRes = LanguageEngine.reversal(l1Array);

  return (
    <div className="w-full h-full bg-[#fafafa] overflow-y-auto p-6 space-y-6 text-slate-900 font-sans select-none">
      {/* Sub-Header Navbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Formal Languages & String Operations Lab</h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Interactive experimentation environment for Alphabets, Strings, Operations & Language Set Algebra
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-200/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('strings')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'strings' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            String Operations
          </button>
          <button
            onClick={() => setActiveTab('languages')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'languages' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Language Operations
          </button>
        </div>
      </div>

      {activeTab === 'strings' ? (
        <div className="space-y-6">
          {/* Inputs Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-extrabold text-slate-700 block">String $w_1$:</label>
              <input
                type="text"
                value={strW1}
                onChange={(e) => setStrW1(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
              />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-extrabold text-slate-700 block">String $w_2$:</label>
              <input
                type="text"
                value={strW2}
                onChange={(e) => setStrW2(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
              />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-extrabold text-slate-700 block">Power $k$ for $w_1^k$:</label>
              <input
                type="number"
                min="0"
                max="10"
                value={powerK}
                onChange={(e) => setPowerK(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* String Operations Output Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase block">Length $|w_1|$</span>
              <span className="text-xl font-black text-cyan-700 font-mono">{StringOps.length(strW1)}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase block">Reversal $w_1^R$</span>
              <span className="text-xl font-black text-purple-700 font-mono">{reversed}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase block">Concatenation $w_1 w_2$</span>
              <span className="text-xl font-black text-emerald-700 font-mono">{concat}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase block">Power $w_1^{powerK}$</span>
              <span className="text-xl font-black text-indigo-700 font-mono">{powered}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase block">Prefixes of $w_1$</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {prefixes.map((p, idx) => (
                  <span key={idx} className="bg-cyan-100 text-cyan-900 text-xs font-mono font-bold px-2 py-0.5 rounded-lg">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase block">Suffixes of $w_1$</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suffixes.map((s, idx) => (
                  <span key={idx} className="bg-purple-100 text-purple-900 text-xs font-mono font-bold px-2 py-0.5 rounded-lg">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Language Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-extrabold text-slate-700 block">Language $L_1$ (Comma separated):</label>
              <input
                type="text"
                value={l1Input}
                onChange={(e) => setL1Input(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
              />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-extrabold text-slate-700 block">Language $L_2$ (Comma separated):</label>
              <input
                type="text"
                value={l2Input}
                onChange={(e) => setL2Input(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Language Algebra Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase block">Union $L_1 \cup L_2$</span>
              <div className="flex flex-wrap gap-1 pt-1 font-mono text-xs font-bold text-cyan-800">
                {'{ ' + unionRes.join(', ') + ' }'}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase block">Intersection $L_1 \cap L_2$</span>
              <div className="flex flex-wrap gap-1 pt-1 font-mono text-xs font-bold text-emerald-800">
                {interRes.length > 0 ? '{ ' + interRes.join(', ') + ' }' : '∅ (Empty Set)'}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase block">Difference $L_1 - L_2$</span>
              <div className="flex flex-wrap gap-1 pt-1 font-mono text-xs font-bold text-rose-800">
                {diffRes.length > 0 ? '{ ' + diffRes.join(', ') + ' }' : '∅'}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase block">Concatenation $L_1 L_2$</span>
              <div className="flex flex-wrap gap-1 pt-1 font-mono text-xs font-bold text-indigo-800">
                {'{ ' + concatRes.join(', ') + ' }'}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase block">Kleene Star $L_1^*$ (Sampled)</span>
              <div className="flex flex-wrap gap-1 pt-1 font-mono text-xs font-bold text-amber-800 max-h-24 overflow-y-auto">
                {'{ ' + starRes.slice(0, 15).join(', ') + '... }'}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase block">Reversal $L_1^R$</span>
              <div className="flex flex-wrap gap-1 pt-1 font-mono text-xs font-bold text-purple-800">
                {'{ ' + revRes.join(', ') + ' }'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
