import React from 'react';
import { NodeType, LinkType } from '../types/network';
import { Globe, Plus, Trash2, Sparkles, Cable, HelpCircle } from 'lucide-react';

interface SandboxPanelProps {
  nodeCount: number;
  linkCount: number;
  onAddNode: (type: NodeType) => void;
  onLoadPreset: (preset: 'star' | 'router' | 'cloud') => void;
  onClearCanvas: () => void;
}

export const SandboxPanel: React.FC<SandboxPanelProps> = ({
  nodeCount,
  linkCount,
  onAddNode,
  onLoadPreset,
  onClearCanvas,
}) => {
  return (
    <div className="bg-[#fefefe] border-r border-slate-200 text-slate-900 w-full md:w-80 flex flex-col h-full overflow-hidden select-none">
      {/* Sandbox Header */}
      <div className="p-3 border-b border-slate-200 bg-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-cyan-700" />
          <h3 className="font-bold text-xs tracking-wider text-slate-900">SANDBOX LAB</h3>
        </div>
        <span className="text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300 px-2 py-0.5 rounded-full font-mono">
          FREE BUILD
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-5 text-xs">
        {/* Device Palette Grid */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-slate-800 tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-cyan-600" /> ADD NETWORK DEVICES
          </h4>
          <p className="text-[11px] text-slate-600">Click any device to place it on the canvas:</p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onAddNode('pc')}
              className="p-2.5 bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-400 rounded-xl font-bold text-slate-800 flex items-center gap-2 transition shadow-xs text-left"
            >
              <div className="p-1 bg-cyan-100 rounded text-cyan-800 text-[10px] font-mono">PC</div>
              <span>Workstation</span>
            </button>

            <button
              onClick={() => onAddNode('laptop')}
              className="p-2.5 bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-400 rounded-xl font-bold text-slate-800 flex items-center gap-2 transition shadow-xs text-left"
            >
              <div className="p-1 bg-cyan-100 rounded text-cyan-800 text-[10px] font-mono">LAP</div>
              <span>Laptop</span>
            </button>

            <button
              onClick={() => onAddNode('switch')}
              className="p-2.5 bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-400 rounded-xl font-bold text-slate-800 flex items-center gap-2 transition shadow-xs text-left"
            >
              <div className="p-1 bg-emerald-100 rounded text-emerald-800 text-[10px] font-mono">SW</div>
              <span>L2 Switch</span>
            </button>

            <button
              onClick={() => onAddNode('router')}
              className="p-2.5 bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-400 rounded-xl font-bold text-slate-800 flex items-center gap-2 transition shadow-xs text-left"
            >
              <div className="p-1 bg-amber-100 rounded text-amber-800 text-[10px] font-mono">RT</div>
              <span>L3 Router</span>
            </button>

            <button
              onClick={() => onAddNode('server')}
              className="p-2.5 bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-400 rounded-xl font-bold text-slate-800 flex items-center gap-2 transition shadow-xs text-left"
            >
              <div className="p-1 bg-purple-100 rounded text-purple-800 text-[10px] font-mono">SRV</div>
              <span>Server</span>
            </button>

            <button
              onClick={() => onAddNode('firewall')}
              className="p-2.5 bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-400 rounded-xl font-bold text-slate-800 flex items-center gap-2 transition shadow-xs text-left"
            >
              <div className="p-1 bg-rose-100 rounded text-rose-800 text-[10px] font-mono">FW</div>
              <span>Firewall</span>
            </button>

            <button
              onClick={() => onAddNode('load_balancer')}
              className="p-2.5 bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-400 rounded-xl font-bold text-slate-800 flex items-center gap-2 transition shadow-xs text-left"
            >
              <div className="p-1 bg-blue-100 rounded text-blue-800 text-[10px] font-mono">LB</div>
              <span>Load Balancer</span>
            </button>

            <button
              onClick={() => onAddNode('iot_sensor')}
              className="p-2.5 bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-400 rounded-xl font-bold text-slate-800 flex items-center gap-2 transition shadow-xs text-left"
            >
              <div className="p-1 bg-teal-100 rounded text-teal-800 text-[10px] font-mono">IoT</div>
              <span>IoT Sensor</span>
            </button>
          </div>
        </div>

        {/* Preset Topologies */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-slate-800 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> STARTER PRESETS
          </h4>
          <div className="space-y-1.5">
            <button
              onClick={() => onLoadPreset('star')}
              className="w-full p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 flex items-center justify-between transition shadow-xs"
            >
              <span>Star Topology Network</span>
              <span className="text-cyan-700 text-[11px]">Load</span>
            </button>
          </div>
        </div>

        {/* Quick Help Guide */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px] text-slate-700">
          <div className="font-bold text-slate-900 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-600" /> How to Build & Connect:
          </div>
          <ul className="space-y-1 list-disc list-inside">
            <li>Left Click node to drag move.</li>
            <li>Right Click node for Context Menu (Move, Configure, Connect Cable).</li>
            <li>Double Click node to open IP/Routing inspector.</li>
          </ul>
        </div>

        {/* Clear Canvas */}
        <div className="pt-2">
          <button
            onClick={onClearCanvas}
            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Trash2 className="w-4 h-4 text-rose-600" /> Clear Canvas & Reset
          </button>
        </div>
      </div>
    </div>
  );
};
