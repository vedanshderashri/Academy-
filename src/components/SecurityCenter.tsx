import React from 'react';
import { SecurityAlert, NetworkNode } from '../types/network';
import { ShieldAlert, ShieldCheck, Zap, AlertOctagon, Lock, Eye, Crosshair } from 'lucide-react';

interface SecurityCenterProps {
  alerts: SecurityAlert[];
  nodes: NetworkNode[];
  onInjectAttack: (attackType: 'ATTACK_PORT_SCAN' | 'ATTACK_DDOS' | 'ATTACK_ARP_SPOOF', targetNodeId: string) => void;
  onMitigateAlert: (alertId: string) => void;
  onClose: () => void;
}

export const SecurityCenter: React.FC<SecurityCenterProps> = ({
  alerts,
  nodes,
  onInjectAttack,
  onMitigateAlert,
  onClose,
}) => {
  const [selectedTargetId, setSelectedTargetId] = React.useState<string>(nodes[0]?.id || '');

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#fefefe] border border-slate-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 text-red-700 border border-red-300 rounded-xl">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">SECURITY CENTER & RED/BLUE TEAM LAB</h3>
              <p className="text-xs text-slate-600 font-medium">
                Educational Cyber Attack Simulation & Intrusion Detection System (IDS)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold">
            Close
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          {/* Red Team Attack Control Grid */}
          <div className="bg-red-50/70 p-4 rounded-xl border border-red-200 space-y-3">
            <h4 className="font-bold text-sm text-red-800 flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-red-700" />
              RED TEAM: INJECT CONTROLLED SIMULATED ATTACK
            </h4>
            <p className="text-slate-600 text-[11px] font-medium">
              Simulate malicious network traffic vectors strictly inside the game environment to test defensive resilience.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="bg-white border border-slate-300 text-slate-900 font-bold rounded-lg p-2 font-mono"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    Target: {n.name} ({n.interfaces[0]?.ip || 'No IP'})
                  </option>
                ))}
              </select>

              <button
                onClick={() => onInjectAttack('ATTACK_PORT_SCAN', selectedTargetId)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-1 transition"
              >
                <Eye className="w-3.5 h-3.5" /> Port Scan
              </button>

              <button
                onClick={() => onInjectAttack('ATTACK_DDOS', selectedTargetId)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-1 transition"
              >
                <Zap className="w-3.5 h-3.5" /> DDoS Flood
              </button>

              <button
                onClick={() => onInjectAttack('ATTACK_ARP_SPOOF', selectedTargetId)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-1 transition"
              >
                <AlertOctagon className="w-3.5 h-3.5" /> ARP Spoof
              </button>
            </div>
          </div>

          {/* Blue Team IDS Intrusion Telemetry */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-sm text-cyan-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-700" />
              BLUE TEAM: INTRUSION DETECTION SYSTEM (IDS) TELEMETRY
            </h4>

            {alerts.length === 0 ? (
              <div className="p-4 text-center text-slate-500 font-mono">
                No active security threats detected. All systems operating securely.
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border flex items-center justify-between font-mono ${
                      alert.mitigated
                        ? 'bg-white border-slate-200 text-slate-500'
                        : 'bg-red-50 border-red-300 text-red-900'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center gap-2">
                        <span>{alert.title}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 mt-0.5">{alert.message}</p>
                    </div>

                    {!alert.mitigated ? (
                      <button
                        onClick={() => onMitigateAlert(alert.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Lock className="w-3.5 h-3.5" /> Block & Mitigate
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold text-xs">✓ Mitigated</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
