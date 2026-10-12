import React, { useState } from 'react';
import { Mission, NetworkNode, NetworkLink, PacketTrace } from '../types/network';
import { generateAIMission } from '../ai/OpenRouterClient';
import { Award, CheckCircle2, Circle, HelpCircle, ChevronRight, Sparkles, PlusCircle, Loader2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MissionPanelProps {
  missions: Mission[];
  currentMission: Mission;
  nodes: NetworkNode[];
  links: NetworkLink[];
  packetLogs: PacketTrace[];
  onSelectMission: (mission: Mission) => void;
  onRewardClaimed: (amount: number) => void;
  onAddCustomMission?: (mission: Mission) => void;
}

export const MissionPanel: React.FC<MissionPanelProps> = ({
  missions,
  currentMission,
  nodes,
  links,
  packetLogs,
  onSelectMission,
  onRewardClaimed,
  onAddCustomMission,
}) => {
  const [showHint, setShowHint] = useState<boolean>(false);
  const [claimed, setClaimed] = useState<boolean>(false);

  // AI Mission Builder Modal state
  const [showAIMissionModal, setShowAIMissionModal] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isBuildingAIMission, setIsBuildingAIMission] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Evaluate goals against live simulation state
  const evaluatedGoals = currentMission.goals.map((g) => ({
    ...g,
    completed: g.check(nodes, links, packetLogs),
  }));

  const allGoalsCompleted = evaluatedGoals.every((g) => g.completed);

  const handleClaim = () => {
    if (allGoalsCompleted && !claimed) {
      setClaimed(true);
      onRewardClaimed(currentMission.rewardMoney);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleCreateAIMission = async () => {
    if (!customPrompt.trim()) return;
    setIsBuildingAIMission(true);
    setAiError(null);

    try {
      const res = await generateAIMission(customPrompt);
      const newMissionId = 900 + Math.floor(Math.random() * 1000);

      // Detect if user requested a specific number of PCs (e.g. "20 pcs" or "10 pcs")
      const pcMatch = customPrompt.match(/(\d+)\s*(?:pcs|pc|workstation|computer)/i);
      const requestedPcCount = pcMatch ? Math.min(parseInt(pcMatch[1], 10), 30) : 4;

      // Generate dynamic initial nodes layout
      const dynamicNodes: NetworkNode[] = [];
      const dynamicLinks: NetworkLink[] = [];

      // Add Core Switch
      const coreSwitch: NetworkNode = {
        id: `sw-ai-core`,
        name: 'Core-Switch',
        type: 'switch',
        x: 450,
        y: 260,
        status: 'online',
        interfaces: [{ id: 'if-sw-core', name: 'eth0', mac: '00:99:88:77:66:00', ip: '192.168.1.1', subnetMask: '255.255.255.0', vlanId: 1, mode: 'access', queue: [], maxQueueSize: 50, bytesSent: 0, bytesReceived: 0 }],
        macTable: [],
        routingTable: [],
        arpCache: [],
        firewallRules: [],
        services: {},
        cpuUsagePct: 5,
        memoryUsagePct: 10,
        powerConsumptionWatt: 35,
        purchaseCost: 300,
        monthlyMaintenanceCost: 10,
      };
      dynamicNodes.push(coreSwitch);

      for (let i = 1; i <= requestedPcCount; i++) {
        const pcId = `pc-ai-${i}`;
        const ifId = `if-pc-ai-${i}`;
        const cols = 5;
        const row = Math.floor((i - 1) / cols);
        const col = (i - 1) % cols;

        const pcNode: NetworkNode = {
          id: pcId,
          name: `PC-${i}`,
          type: 'pc',
          x: 200 + col * 120,
          y: 100 + row * 90,
          status: 'online',
          interfaces: [
            {
              id: ifId,
              name: 'eth0',
              mac: `00:11:22:33:${Math.floor(i / 10)}:${i % 10}`,
              ip: `192.168.1.${10 + i}`,
              subnetMask: '255.255.255.0',
              vlanId: 1,
              mode: 'access',
              queue: [],
              maxQueueSize: 50,
              bytesSent: 0,
              bytesReceived: 0,
            },
          ],
          macTable: [],
          routingTable: [],
          arpCache: [],
          firewallRules: [],
          services: {},
          cpuUsagePct: 5,
          memoryUsagePct: 10,
          powerConsumptionWatt: 40,
          purchaseCost: 400,
          monthlyMaintenanceCost: 10,
        };
        dynamicNodes.push(pcNode);

        dynamicLinks.push({
          id: `link-ai-${i}`,
          fromNodeId: pcId,
          fromInterfaceId: ifId,
          toNodeId: coreSwitch.id,
          toInterfaceId: 'if-sw-core',
          type: 'cat6',
          status: 'active',
          lengthMeters: 10,
          trafficLoadPct: 0,
        });
      }

      const generatedMission: Mission = {
        id: newMissionId,
        title: res.title || `AI Mission: ${requestedPcCount} PCs Network`,
        category: 'Enterprise',
        difficulty: res.difficulty || 'Intermediate',
        description: res.description || `Build and verify connectivity across a network of ${requestedPcCount} PCs.`,
        objectives: res.objectives || [
          `Ensure all ${requestedPcCount} PCs are powered ONLINE.`,
          'Verify link cables connect each PC to Core-Switch.',
          'Test ICMP traffic flow across the switch subnet.',
        ],
        startingBudget: res.startingBudget || 25000,
        hint: res.hint || 'Check IP address configurations and subnet masks on each PC.',
        rewardMoney: res.rewardMoney || 5000,
        initialNodes: dynamicNodes,
        initialLinks: dynamicLinks,
        unlockedDevices: ['pc', 'switch', 'router', 'server'],
        explanation: res.explanation || 'AI generated dynamic lab topology.',
        goals: [
          {
            id: 'g-ai-1',
            description: `Ensure all ${requestedPcCount} PCs are ONLINE and operational.`,
            check: (nodes) => nodes.every((n) => n.status === 'online'),
            completed: false,
          },
          {
            id: 'g-ai-2',
            description: 'Verify packet transmission across all link paths.',
            check: (_, links) => links.length >= 2,
            completed: false,
          },
        ],
      };

      if (onAddCustomMission) {
        onAddCustomMission(generatedMission);
      }
      onSelectMission(generatedMission);
      setShowAIMissionModal(false);
      setCustomPrompt('');
    } catch (err: any) {
      console.error(err);
      setAiError(err?.message || 'Failed to build AI mission via OpenRouter. Please try again.');
    } finally {
      setIsBuildingAIMission(false);
    }
  };

  return (
    <div className="bg-[#fefefe] border-r border-slate-200 text-slate-900 w-full md:w-80 flex flex-col h-full overflow-hidden select-none">
      {/* Sidebar Mission Header */}
      <div className="p-3 border-b border-slate-200 bg-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-600" />
          <h3 className="font-bold text-xs tracking-wider text-slate-900">MISSIONS & CAMPAIGN</h3>
        </div>
        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
          {currentMission.difficulty}
        </span>
      </div>

      {/* Mission Selector Dropdown & AI Builder button */}
      <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
        <select
          value={currentMission.id}
          onChange={(e) => {
            const selected = missions.find((m) => m.id === parseInt(e.target.value, 10));
            if (selected) {
              setClaimed(false);
              setShowHint(false);
              onSelectMission(selected);
            }
          }}
          className="w-full bg-white border border-slate-300 text-xs text-slate-900 rounded-lg p-2 font-semibold focus:outline-none focus:border-cyan-600 shadow-xs"
        >
          {missions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowAIMissionModal(true)}
          className="w-full py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Create AI Custom Mission</span>
        </button>
      </div>

      {/* Current Mission Detail */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        <div>
          <h2 className="font-bold text-sm text-cyan-800 mb-1">{currentMission.title}</h2>
          <p className="text-slate-600 leading-relaxed text-[11px] font-medium">{currentMission.description}</p>
        </div>

        {/* Objectives Checklist */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-slate-800 tracking-wider">OBJECTIVES</h4>
          <ul className="space-y-1.5">
            {currentMission.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-700 text-[11px] font-medium">
                <ChevronRight className="w-3.5 h-3.5 text-cyan-600 mt-0.5 flex-shrink-0" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Live Evaluation Checklist */}
        <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
          <h4 className="font-bold text-xs text-slate-800 tracking-wider">VERIFICATION GOALS</h4>
          <div className="space-y-2">
            {evaluatedGoals.map((goal) => (
              <div key={goal.id} className="flex items-start gap-2 text-[11px]">
                {goal.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                )}
                <span className={goal.completed ? 'text-emerald-800 font-bold' : 'text-slate-600'}>
                  {goal.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hint Box */}
        <div>
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showHint ? 'Hide Instructor Hint' : 'Need a Hint?'}
          </button>
          {showHint && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] font-medium">
              {currentMission.hint}
            </div>
          )}
        </div>

        {/* Claim Reward Section */}
        <div className="pt-2">
          {allGoalsCompleted ? (
            <button
              onClick={handleClaim}
              disabled={claimed}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                claimed
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {claimed ? 'Lab Completed ✓' : 'Complete Lab & Submit'}
            </button>
          ) : (
            <div className="text-center py-2 text-slate-500 text-[11px] font-mono">
              Complete all verification goals to complete this lab.
            </div>
          )}
        </div>
      </div>

      {/* AI Mission Generator Modal */}
      {showAIMissionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-cyan-600" />
                <h3 className="font-bold text-slate-900 text-sm">CREATE AI CUSTOM MISSION (GEMINI 2.0)</h3>
              </div>
              <button
                onClick={() => setShowAIMissionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 text-xs font-medium">
              Enter any networking challenge concept or scenario, and Gemini 2.0 via OpenRouter will design a custom mission for you!
            </p>

            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Design a high-availability network with redundant router links and firewall protection against port scanning attacks..."
              className="w-full h-28 bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 font-medium resize-none"
            />

            {aiError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium">
                {aiError}
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAIMissionModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateAIMission}
                disabled={isBuildingAIMission || !customPrompt.trim()}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-cyan-600/20"
              >
                {isBuildingAIMission ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                <span>{isBuildingAIMission ? 'Generating Mission...' : 'Generate & Launch Mission'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

