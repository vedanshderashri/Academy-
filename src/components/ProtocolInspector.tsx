import React, { useState } from 'react';
import { PacketTrace } from '../types/network';
import { ChevronRight, ChevronDown, Layers } from 'lucide-react';

interface ProtocolInspectorProps {
  packetLogs: PacketTrace[];
  onClearLogs: () => void;
}

export const ProtocolInspector: React.FC<ProtocolInspectorProps> = ({ packetLogs, onClearLogs }) => {
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [filterProtocol, setFilterProtocol] = useState<string>('ALL');
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({
    l1: true,
    l2: true,
    l3: true,
    l4: true,
    l7: true,
  });

  const selectedTrace = packetLogs.find((p) => p.id === selectedTraceId);

  const filteredLogs = packetLogs.filter((p) => {
    if (filterProtocol === 'ALL') return true;
    if (filterProtocol === 'ARP') return p.frame.ethertype === 'ARP';
    if (filterProtocol === 'ICMP') return p.frame.payload?.protocol === 'ICMP';
    if (filterProtocol === 'TCP') return p.frame.payload?.protocol === 'TCP';
    if (filterProtocol === 'UDP') return p.frame.payload?.protocol === 'UDP';
    if (filterProtocol === 'HTTP') return p.frame.payload?.payload.payload.type.startsWith('HTTP');
    if (filterProtocol === 'DNS') return p.frame.payload?.payload.payload.type.startsWith('DNS');
    return true;
  });

  const toggleLayer = (layerKey: string) => {
    setExpandedLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div className="bg-[#fefefe] border-l border-slate-200 text-slate-900 w-full md:w-96 flex flex-col h-full overflow-hidden select-none">
      {/* Inspector Header */}
      <div className="p-3 border-b border-slate-200 bg-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-700" />
          <h3 className="font-bold text-xs tracking-wider text-slate-900">PROTOCOL INSPECTOR</h3>
        </div>
        <button
          onClick={onClearLogs}
          className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition"
        >
          Clear Captures
        </button>
      </div>

      {/* Protocol Filter Tabs */}
      <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center gap-1 overflow-x-auto text-[11px]">
        {['ALL', 'ARP', 'ICMP', 'TCP', 'UDP', 'HTTP', 'DNS'].map((proto) => (
          <button
            key={proto}
            onClick={() => setFilterProtocol(proto)}
            className={`px-2 py-1 rounded-md font-mono ${
              filterProtocol === proto
                ? 'bg-cyan-600 text-white font-bold'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {proto}
          </button>
        ))}
      </div>

      {/* Packet Trace Log Table (Wireshark View Light Mode) */}
      <div className="flex-1 overflow-y-auto font-mono text-xs border-b border-slate-200">
        {filteredLogs.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs font-sans">
            No packet traces captured yet. Start simulation traffic to inspect live frames.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-600 text-[10px] sticky top-0 border-b border-slate-200">
              <tr>
                <th className="p-2">NO.</th>
                <th className="p-2">SRC MAC / IP</th>
                <th className="p-2">DST MAC / IP</th>
                <th className="p-2">PROTO</th>
                <th className="p-2">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.map((trace, idx) => {
                const isSelected = trace.id === selectedTraceId;
                const frame = trace.frame;
                const pkt = frame.payload;
                const protoStr = frame.ethertype === 'ARP' ? 'ARP' : pkt?.protocol || 'ETH';

                return (
                  <tr
                    key={trace.id}
                    onClick={() => setSelectedTraceId(trace.id)}
                    className={`cursor-pointer transition hover:bg-slate-100 ${
                      isSelected ? 'bg-cyan-50 border-l-4 border-cyan-600 font-semibold' : ''
                    }`}
                  >
                    <td className="p-2 text-slate-500">{filteredLogs.length - idx}</td>
                    <td className="p-2 text-cyan-800 truncate max-w-[80px]">
                      {pkt ? pkt.srcIp : frame.srcMac}
                    </td>
                    <td className="p-2 text-cyan-800 truncate max-w-[80px]">
                      {pkt ? pkt.dstIp : frame.dstMac}
                    </td>
                    <td className="p-2 font-bold text-amber-700">{protoStr}</td>
                    <td className="p-2">
                      {trace.status === 'DELIVERED' ? (
                        <span className="text-emerald-600 font-bold">✓</span>
                      ) : (
                        <span className="text-rose-600 font-bold">✗</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Selected Packet OSI Layer Inspector Drawer */}
      {selectedTrace ? (
        <div className="h-64 bg-slate-50 p-3 overflow-y-auto border-t border-slate-200 font-mono text-xs">
          <h4 className="text-[11px] font-bold text-slate-800 mb-2 flex items-center justify-between border-b border-slate-200 pb-1">
            <span>PACKET ENCAPSULATION STACK</span>
            <span className="text-cyan-700 text-[10px]">{selectedTrace.id}</span>
          </h4>

          {/* Layer 1: Physical */}
          <div className="mb-2 border border-slate-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => toggleLayer('l1')}
              className="w-full bg-slate-100 p-2 text-left text-slate-800 font-bold flex items-center justify-between"
            >
              <span>Frame L1: Physical Medium & Transmission</span>
              {expandedLayers.l1 ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {expandedLayers.l1 && (
              <div className="p-2 bg-white text-slate-700 space-y-1 text-[11px]">
                <p>Status: <span className="text-emerald-700 font-bold">{selectedTrace.status}</span></p>
                <p>Transmission Progress: {(selectedTrace.progress * 100).toFixed(0)}%</p>
              </div>
            )}
          </div>

          {/* Layer 2: Data Link (Ethernet Frame) */}
          <div className="mb-2 border border-slate-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => toggleLayer('l2')}
              className="w-full bg-slate-100 p-2 text-left text-slate-800 font-bold flex items-center justify-between"
            >
              <span>Frame L2: Ethernet II (MAC Header)</span>
              {expandedLayers.l2 ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {expandedLayers.l2 && (
              <div className="p-2 bg-white text-slate-700 space-y-1 text-[11px]">
                <p>Source MAC: <span className="text-cyan-800 font-bold">{selectedTrace.frame.srcMac}</span></p>
                <p>Destination MAC: <span className="text-cyan-800 font-bold">{selectedTrace.frame.dstMac}</span></p>
                <p>VLAN Tag (802.1Q): <span className="text-amber-700 font-bold">VLAN {selectedTrace.frame.vlanId || 1}</span></p>
                <p>EtherType: <span className="text-rose-700 font-bold">0x0800 ({selectedTrace.frame.ethertype})</span></p>
              </div>
            )}
          </div>

          {/* Layer 3: Network (IP Header) */}
          {selectedTrace.frame.payload && (
            <div className="mb-2 border border-slate-200 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => toggleLayer('l3')}
                className="w-full bg-slate-100 p-2 text-left text-slate-800 font-bold flex items-center justify-between"
              >
                <span>Packet L3: IPv4 Header</span>
                {expandedLayers.l3 ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {expandedLayers.l3 && (
                <div className="p-2 bg-white text-slate-700 space-y-1 text-[11px]">
                  <p>Source IP: <span className="text-cyan-800 font-bold">{selectedTrace.frame.payload.srcIp}</span></p>
                  <p>Destination IP: <span className="text-cyan-800 font-bold">{selectedTrace.frame.payload.dstIp}</span></p>
                  <p>Time to Live (TTL): <span className="text-emerald-700 font-bold">{selectedTrace.frame.payload.ttl} hops</span></p>
                  <p>Protocol: <span className="text-amber-700 font-bold">{selectedTrace.frame.payload.protocol}</span></p>
                </div>
              )}
            </div>
          )}

          {/* Layer 4: Transport (TCP / UDP Segment) */}
          {selectedTrace.frame.payload?.payload && (
            <div className="mb-2 border border-slate-200 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => toggleLayer('l4')}
                className="w-full bg-slate-100 p-2 text-left text-slate-800 font-bold flex items-center justify-between"
              >
                <span>Segment L4: {selectedTrace.frame.payload.payload.protocol} Segment</span>
                {expandedLayers.l4 ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {expandedLayers.l4 && (
                <div className="p-2 bg-white text-slate-700 space-y-1 text-[11px]">
                  <p>Source Port: <span className="text-cyan-800 font-bold">{selectedTrace.frame.payload.payload.srcPort}</span></p>
                  <p>Destination Port: <span className="text-cyan-800 font-bold">{selectedTrace.frame.payload.payload.dstPort}</span></p>
                  <p>Sequence Number: <span className="text-purple-700 font-bold">{selectedTrace.frame.payload.payload.seqNumber || 1001}</span></p>
                </div>
              )}
            </div>
          )}

          {/* Layer 7: Application Data */}
          {selectedTrace.frame.payload?.payload.payload && (
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => toggleLayer('l7')}
                className="w-full bg-slate-100 p-2 text-left text-slate-800 font-bold flex items-center justify-between"
              >
                <span>Application L7: {selectedTrace.frame.payload.payload.payload.type}</span>
                {expandedLayers.l7 ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {expandedLayers.l7 && (
                <div className="p-2 bg-white text-emerald-800 font-mono text-[11px]">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(selectedTrace.frame.payload.payload.payload.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-slate-50 text-center text-slate-500 text-xs">
          Select any packet trace from the list above to view full OSI Layer headers.
        </div>
      )}
    </div>
  );
};
