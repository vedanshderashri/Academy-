import React, { useState } from 'react';
import { NetworkNode, FirewallRule, RouteEntry, DNSRecord } from '../types/network';
import { X, Settings, Network, Shield, Server, List, Send, Plus, Trash2, Globe } from 'lucide-react';

interface NodeConfigModalProps {
  node: NetworkNode;
  allNodes: NetworkNode[];
  onClose: () => void;
  onUpdateNode: (updatedNode: NetworkNode) => void;
  onSendPing: (sourceNodeId: string, targetIp: string) => void;
  onSendHttpRequest: (sourceNodeId: string, targetDomain: string) => void;
}

export const NodeConfigModal: React.FC<NodeConfigModalProps> = ({
  node,
  allNodes,
  onClose,
  onUpdateNode,
  onSendPing,
  onSendHttpRequest,
}) => {
  const [activeTab, setActiveTab] = useState<'interfaces' | 'routing' | 'vlan' | 'services' | 'firewall' | 'tables' | 'tools'>('interfaces');

  // Interface state
  const [ipInput, setIpInput] = useState(node.interfaces[0]?.ip || '');
  const [maskInput, setMaskInput] = useState(node.interfaces[0]?.subnetMask || '255.255.255.0');
  const [vlanInput, setVlanInput] = useState(node.interfaces[0]?.vlanId || 1);

  // Tools state
  const [pingTargetIp, setPingTargetIp] = useState('');
  const [httpTargetDomain, setHttpTargetDomain] = useState('www.tycoon.com');

  // New Route state
  const [newDestCIDR, setNewDestCIDR] = useState('192.168.2.0/24');
  const [newNextHop, setNewNextHop] = useState('192.168.1.1');

  // New Firewall Rule state
  const [fwAction, setFwAction] = useState<'ALLOW' | 'DENY'>('DENY');
  const [fwProtocol, setFwProtocol] = useState<'ANY' | 'TCP' | 'UDP' | 'ICMP'>('TCP');
  const [fwSrcCIDR, setFwSrcCIDR] = useState('0.0.0.0/0');
  const [fwPort, setFwPort] = useState('22');

  // New DNS Record state
  const [dnsDomain, setDnsDomain] = useState('www.company.com');
  const [dnsIp, setDnsIp] = useState('192.168.1.50');

  const handleSaveInterface = () => {
    const updated = { ...node };
    if (updated.interfaces[0]) {
      updated.interfaces[0].ip = ipInput;
      updated.interfaces[0].subnetMask = maskInput;
      updated.interfaces[0].vlanId = vlanInput;
    }
    onUpdateNode(updated);
  };

  const handleAddRoute = () => {
    const updated = { ...node };
    const newRoute: RouteEntry = {
      id: `static-${Date.now()}`,
      destinationCIDR: newDestCIDR,
      nextHop: newNextHop,
      interfaceId: node.interfaces[0]?.id || 'eth0',
      metric: 1,
      type: 'STATIC',
    };
    updated.routingTable = [...updated.routingTable, newRoute];
    onUpdateNode(updated);
  };

  const handleDeleteRoute = (id: string) => {
    const updated = { ...node };
    updated.routingTable = updated.routingTable.filter((r) => r.id !== id);
    onUpdateNode(updated);
  };

  const handleAddFirewallRule = () => {
    const updated = { ...node };
    const newRule: FirewallRule = {
      id: `fw-${Date.now()}`,
      priority: updated.firewallRules.length + 1,
      action: fwAction,
      protocol: fwProtocol,
      srcCIDR: fwSrcCIDR,
      dstCIDR: '0.0.0.0/0',
      dstPort: parseInt(fwPort, 10) || undefined,
      description: `${fwAction} ${fwProtocol} Port ${fwPort} from ${fwSrcCIDR}`,
    };
    updated.firewallRules = [...updated.firewallRules, newRule];
    onUpdateNode(updated);
  };

  const handleDeleteFirewallRule = (id: string) => {
    const updated = { ...node };
    updated.firewallRules = updated.firewallRules.filter((r) => r.id !== id);
    onUpdateNode(updated);
  };

  const handleAddDnsRecord = () => {
    const updated = { ...node };
    if (!updated.services.dnsServer) {
      updated.services.dnsServer = { enabled: true, records: [] };
    }
    const newRecord: DNSRecord = {
      domain: dnsDomain,
      ip: dnsIp,
      type: 'A',
      ttl: 300,
    };
    updated.services.dnsServer.records.push(newRecord);
    onUpdateNode(updated);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#fefefe] border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-100 text-cyan-800 border border-cyan-300 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{node.name} Configuration</h3>
              <p className="text-xs text-slate-600 font-mono">
                TYPE: {node.type.toUpperCase()} | MAC: {node.interfaces[0]?.mac || 'N/A'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Tabs */}
        <div className="flex items-center bg-slate-50 px-4 border-b border-slate-200 space-x-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('interfaces')}
            className={`py-3 px-3 border-b-2 font-bold flex items-center gap-1.5 ${
              activeTab === 'interfaces' ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Network className="w-3.5 h-3.5" /> IP Interfaces
          </button>
          {node.type === 'switch' && (
            <button
              onClick={() => setActiveTab('vlan')}
              className={`py-3 px-3 border-b-2 font-bold flex items-center gap-1.5 ${
                activeTab === 'vlan' ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> VLAN Setup
            </button>
          )}
          {(node.type === 'router' || node.type === 'firewall') && (
            <button
              onClick={() => setActiveTab('routing')}
              className={`py-3 px-3 border-b-2 font-bold flex items-center gap-1.5 ${
                activeTab === 'routing' ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Routing Table
            </button>
          )}
          {node.type === 'server' && (
            <button
              onClick={() => setActiveTab('services')}
              className={`py-3 px-3 border-b-2 font-bold flex items-center gap-1.5 ${
                activeTab === 'services' ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Server className="w-3.5 h-3.5" /> Services
            </button>
          )}
          <button
            onClick={() => setActiveTab('firewall')}
            className={`py-3 px-3 border-b-2 font-bold flex items-center gap-1.5 ${
              activeTab === 'firewall' ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Firewall ACL
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`py-3 px-3 border-b-2 font-bold flex items-center gap-1.5 ${
              activeTab === 'tables' ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" /> ARP / MAC Tables
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`py-3 px-3 border-b-2 font-bold flex items-center gap-1.5 ${
              activeTab === 'tools' ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" /> Ping & Test
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-sm">
          {/* TAB 1: IP Interfaces */}
          {activeTab === 'interfaces' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">IPv4 Address</label>
                <input
                  type="text"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-cyan-900 focus:outline-none focus:border-cyan-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subnet Mask</label>
                <input
                  type="text"
                  value={maskInput}
                  onChange={(e) => setMaskInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-cyan-900 focus:outline-none focus:border-cyan-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">VLAN Membership</label>
                <input
                  type="number"
                  value={vlanInput}
                  onChange={(e) => setVlanInput(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-cyan-900 focus:outline-none focus:border-cyan-600 font-bold"
                />
              </div>

              <button
                onClick={handleSaveInterface}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-xs transition"
              >
                Save Interface Config
              </button>
            </div>
          )}

          {/* TAB 2: Routing Table */}
          {activeTab === 'routing' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800">Active Routing Entries</h4>
              <div className="space-y-2">
                {node.routingTable.map((route) => (
                  <div key={route.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between font-mono text-xs">
                    <div>
                      <span className="text-cyan-800 font-bold">{route.destinationCIDR}</span> via <span className="text-emerald-700 font-bold">{route.nextHop}</span> (Metric: {route.metric})
                    </div>
                    {route.type === 'STATIC' && (
                      <button onClick={() => handleDeleteRoute(route.id)} className="text-rose-600 hover:text-rose-700 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Static Route Form */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <h5 className="text-xs font-bold text-slate-700">Add Static Route</h5>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Dest CIDR (192.168.2.0/24)"
                    value={newDestCIDR}
                    onChange={(e) => setNewDestCIDR(e.target.value)}
                    className="bg-white border border-slate-300 p-2 rounded text-xs font-mono text-slate-900 font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Next Hop IP (192.168.1.1)"
                    value={newNextHop}
                    onChange={(e) => setNewNextHop(e.target.value)}
                    className="bg-white border border-slate-300 p-2 rounded text-xs font-mono text-slate-900 font-bold"
                  />
                </div>
                <button
                  onClick={handleAddRoute}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Route
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Firewall Rules */}
          {activeTab === 'firewall' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800">Firewall Access Control List (ACL)</h4>
              <div className="space-y-2">
                {node.firewallRules.map((rule) => (
                  <div key={rule.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between font-mono text-xs">
                    <div>
                      <span className={rule.action === 'ALLOW' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                        {rule.action}
                      </span>{' '}
                      {rule.protocol} Port {rule.dstPort || 'ANY'} from {rule.srcCIDR}
                    </div>
                    <button onClick={() => handleDeleteFirewallRule(rule.id)} className="text-rose-600 hover:text-rose-700 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Firewall Rule Form */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <h5 className="text-xs font-bold text-slate-700">Add Firewall ACL Rule</h5>
                <div className="grid grid-cols-4 gap-2">
                  <select
                    value={fwAction}
                    onChange={(e) => setFwAction(e.target.value as any)}
                    className="bg-white border border-slate-300 p-2 rounded text-xs text-slate-900 font-bold"
                  >
                    <option value="ALLOW">ALLOW</option>
                    <option value="DENY">DENY</option>
                  </select>
                  <select
                    value={fwProtocol}
                    onChange={(e) => setFwProtocol(e.target.value as any)}
                    className="bg-white border border-slate-300 p-2 rounded text-xs text-slate-900 font-bold"
                  >
                    <option value="ANY">ANY</option>
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                    <option value="ICMP">ICMP</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Src CIDR (0.0.0.0/0)"
                    value={fwSrcCIDR}
                    onChange={(e) => setFwSrcCIDR(e.target.value)}
                    className="bg-white border border-slate-300 p-2 rounded text-xs font-mono text-slate-900 font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Port (e.g. 22)"
                    value={fwPort}
                    onChange={(e) => setFwPort(e.target.value)}
                    className="bg-white border border-slate-300 p-2 rounded text-xs font-mono text-slate-900 font-bold"
                  />
                </div>
                <button
                  onClick={handleAddFirewallRule}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Rule
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Services (DNS / DHCP / HTTP) */}
          {activeTab === 'services' && node.type === 'server' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800">Server Hosted Services</h4>

              {/* DNS Manager */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <h5 className="text-xs font-bold text-cyan-800">DNS Server (A Records)</h5>
                <div className="space-y-1 font-mono text-xs">
                  {node.services.dnsServer?.records?.map((r, i) => (
                    <div key={i} className="text-slate-800">
                      {r.domain} -&gt; <span className="text-emerald-700 font-bold">{r.ip}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="domain.com"
                    value={dnsDomain}
                    onChange={(e) => setDnsDomain(e.target.value)}
                    className="bg-white border border-slate-300 p-1.5 rounded text-xs font-mono font-bold"
                  />
                  <input
                    type="text"
                    placeholder="192.168.1.50"
                    value={dnsIp}
                    onChange={(e) => setDnsIp(e.target.value)}
                    className="bg-white border border-slate-300 p-1.5 rounded text-xs font-mono font-bold"
                  />
                  <button onClick={handleAddDnsRecord} className="px-2 py-1.5 bg-cyan-600 text-white text-xs rounded font-bold">
                    + Add A Record
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Ping & Diagnostic Tools */}
          {activeTab === 'tools' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-cyan-800">Send ICMP Ping Packet</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Target IP (e.g. 192.168.1.11)"
                    value={pingTargetIp}
                    onChange={(e) => setPingTargetIp(e.target.value)}
                    className="bg-white border border-slate-300 p-2 rounded text-xs font-mono flex-1 text-slate-900 font-bold"
                  />
                  <button
                    onClick={() => onSendPing(node.id, pingTargetIp)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Ping
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-emerald-800">Send HTTP GET Request</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Domain Name (e.g. www.tycoon.com)"
                    value={httpTargetDomain}
                    onChange={(e) => setHttpTargetDomain(e.target.value)}
                    className="bg-white border border-slate-300 p-2 rounded text-xs font-mono flex-1 text-slate-900 font-bold"
                  />
                  <button
                    onClick={() => onSendHttpRequest(node.id, httpTargetDomain)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5" /> HTTP Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
