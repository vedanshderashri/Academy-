import React, { useState, useEffect, useRef } from 'react';
import { DiscreteEngine } from './simulation/core/DiscreteEngine';
import { MISSION_LIST } from './simulation/missions/missionList';
import { Mission, NetworkNode, NetworkLink, NodeType, LinkType, PacketTrace, SecurityAlert, NOCMetrics } from './types/network';
import { diagnoseNetworkState, AIDiagnosticReport } from './ai/AIAssistant';
import { generateMacAddress } from './simulation/protocols/SubnetMath';

// Components
import { TopNavbar, SubjectType } from './components/TopNavbar';
import { TopologyCanvas } from './components/TopologyCanvas';
import { MissionPanel } from './components/MissionPanel';
import { SandboxPanel } from './components/SandboxPanel';
import { ProtocolInspector } from './components/ProtocolInspector';
import { NOCDashboard } from './components/NOCDashboard';
import { NodeConfigModal } from './components/NodeConfigModal';
import { SubnetCalculatorModal } from './components/SubnetCalculatorModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { SecurityCenter } from './components/SecurityCenter';
import { QuizModal } from './components/QuizModal';
import { UserDashboard } from './components/UserDashboard';
import { LoginPage } from './components/LoginPage';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './auth/AuthContext';
import { SidebarRail, AppTab } from './components/SidebarRail';
import { ComputationLabView } from './computation-lab/components/ComputationLabView';
import { TOCMissionPanel } from './computation-lab/components/TOCMissionPanel';
import { DFAModel } from './computation-lab/core/types';
import { AlgorithmArenaView } from './algorithm-arena/components/AlgorithmArenaView';

export const App: React.FC = () => {
  const { user, recordMissionCompleted, recordQuizCompleted } = useAuth();
  const [activeTab, setActiveTab] = useState<AppTab>('dsa-lab');
  const [missionsList, setMissionsList] = useState<Mission[]>(MISSION_LIST);
  const [currentMission, setCurrentMission] = useState<Mission>(MISSION_LIST[0]);
  const [customDFAModel, setCustomDFAModel] = useState<DFAModel | undefined>(undefined);

  // Derive current subject cleanly from active tab
  const currentSubject: SubjectType = activeTab.startsWith('toc-')
    ? 'TOC'
    : activeTab.startsWith('dsa-')
    ? 'DSA'
    : 'NETWORKS';

  // Instantiate Discrete Event Simulation Engine
  const engineRef = useRef<DiscreteEngine>(new DiscreteEngine(MISSION_LIST[0].initialNodes, MISSION_LIST[0].initialLinks));
  const engine = engineRef.current;

  // React state synced with Engine
  const [nodes, setNodes] = useState<NetworkNode[]>(engine.nodes);
  const [links, setLinks] = useState<NetworkLink[]>(engine.links);
  const [activeTraces, setActiveTraces] = useState<PacketTrace[]>(engine.activeTraces);
  const [packetLogs, setPacketLogs] = useState<PacketTrace[]>(engine.packetLogs);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(engine.alerts);
  const [metrics, setMetrics] = useState<NOCMetrics>(engine.metrics);

  // Simulation controls
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Modals state
  const [showNodeConfig, setShowNodeConfig] = useState<boolean>(false);
  const [showSubnetCalc, setShowSubnetCalc] = useState<boolean>(false);
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);
  const [showSecurity, setShowSecurity] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<AIDiagnosticReport | null>(null);

  // Subscribe to Engine notifications
  useEffect(() => {
    const unsubscribe = engine.subscribe(() => {
      setNodes([...engine.nodes]);
      setLinks([...engine.links]);
      setActiveTraces([...engine.activeTraces]);
      setPacketLogs([...engine.packetLogs]);
      setAlerts([...engine.alerts]);
      setMetrics({ ...engine.metrics });
    });
    return () => {
      unsubscribe();
    };
  }, [engine]);

  // Main Simulation Engine Tick Interval
  useEffect(() => {
    const timer = setInterval(() => {
      engine.tick(50);
    }, 50);
    return () => clearInterval(timer);
  }, [engine]);

  // Switch Mode Handler
  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
  };

  // Mission Selection Handler
  const handleSelectMission = (mission: Mission) => {
    setCurrentMission(mission);
    engine.setNodesAndLinks([...mission.initialNodes], [...mission.initialLinks]);
    setSelectedNodeId(null);
    setShowNodeConfig(false);
  };

  // Add Node Handler (Supports all device types)
  const handleAddNode = (type: NodeType) => {
    const nodeCount = nodes.length + 1;
    const newMac = generateMacAddress();
    let defaultIp = `192.168.1.${10 + nodeCount}`;
    if (type === 'router') defaultIp = `192.168.1.1`;
    else if (type === 'server') defaultIp = `192.168.1.50`;
    else if (type === 'firewall') defaultIp = `192.168.1.254`;

    const newNode: NetworkNode = {
      id: `${type}-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      name: `${type.toUpperCase()}-${nodeCount}`,
      type,
      x: 220 + (nodeCount % 5) * 110,
      y: 180 + Math.floor(nodeCount / 5) * 90,
      status: 'online',
      interfaces: [
        {
          id: `if-${Date.now()}`,
          name: 'eth0',
          mac: newMac,
          ip: defaultIp,
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
      services:
        type === 'server'
          ? { webServer: { enabled: true, port: 80, rootPage: '<h1>Welcome to Network Tycoon Server</h1>', requestCount: 0 } }
          : {},
      cpuUsagePct: 10,
      memoryUsagePct: 15,
      powerConsumptionWatt: 50,
      purchaseCost: type === 'router' ? 800 : type === 'switch' ? 300 : 400,
      monthlyMaintenanceCost: 10,
    };

    engine.setNodesAndLinks([...engine.nodes, newNode], engine.links);
  };

  // Connect Nodes Handler
  const handleConnectNodes = (fromNodeId: string, toNodeId: string, linkType: LinkType) => {
    const fromNode = engine.nodes.find((n) => n.id === fromNodeId);
    const toNode = engine.nodes.find((n) => n.id === toNodeId);
    if (!fromNode || !toNode) return;

    const existing = engine.links.find(
      (l) =>
        (l.fromNodeId === fromNodeId && l.toNodeId === toNodeId) ||
        (l.fromNodeId === toNodeId && l.toNodeId === fromNodeId)
    );
    if (existing) return;

    if (!fromNode.interfaces[0]) {
      fromNode.interfaces.push({
        id: `if-${Date.now()}-1`,
        name: 'eth0',
        mac: generateMacAddress(),
        ip: '192.168.1.10',
        subnetMask: '255.255.255.0',
        vlanId: 1,
        mode: 'access',
        queue: [],
        maxQueueSize: 50,
        bytesSent: 0,
        bytesReceived: 0,
      });
    }

    if (!toNode.interfaces[0]) {
      toNode.interfaces.push({
        id: `if-${Date.now()}-2`,
        name: 'eth0',
        mac: generateMacAddress(),
        ip: '192.168.1.11',
        subnetMask: '255.255.255.0',
        vlanId: 1,
        mode: 'access',
        queue: [],
        maxQueueSize: 50,
        bytesSent: 0,
        bytesReceived: 0,
      });
    }

    const newLink: NetworkLink = {
      id: `link-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fromNodeId,
      fromInterfaceId: fromNode.interfaces[0].id,
      toNodeId,
      toInterfaceId: toNode.interfaces[0].id,
      type: linkType,
      status: 'active',
      lengthMeters: 10,
      trafficLoadPct: 0,
    };

    engine.setNodesAndLinks(engine.nodes, [...engine.links, newLink]);
  };

  // Node Dragging Handler
  const handleNodeMove = (nodeId: string, x: number, y: number) => {
    const target = engine.nodes.find((n) => n.id === nodeId);
    if (target) {
      target.x = x;
      target.y = y;
      setNodes([...engine.nodes]);
    }
  };

  // Sandbox Presets Generator
  const handleLoadSandboxPreset = (presetType: 'star' | 'router' | 'cloud') => {
    if (presetType === 'star') {
      const sw: NetworkNode = {
        id: 'sw-star',
        name: 'Core-Switch',
        type: 'switch',
        x: 450,
        y: 260,
        status: 'online',
        interfaces: [],
        macTable: [],
        routingTable: [],
        arpCache: [],
        firewallRules: [],
        services: {},
        cpuUsagePct: 5,
        memoryUsagePct: 10,
        powerConsumptionWatt: 45,
        purchaseCost: 300,
        monthlyMaintenanceCost: 10,
      };

      const pcs: NetworkNode[] = [1, 2, 3, 4].map((i) => ({
        id: `pc-star-${i}`,
        name: `PC-${i}`,
        type: 'pc',
        x: 250 + (i % 2 === 0 ? 400 : 0),
        y: i > 2 ? 400 : 120,
        status: 'online',
        interfaces: [
          {
            id: `if-star-${i}`,
            name: 'eth0',
            mac: `00:1A:2B:00:00:0${i}`,
            ip: `192.168.1.1${i}`,
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
        powerConsumptionWatt: 50,
        purchaseCost: 400,
        monthlyMaintenanceCost: 10,
      }));

      const presetLinks: NetworkLink[] = pcs.map((pc, idx) => ({
        id: `link-star-${idx}`,
        fromNodeId: pc.id,
        fromInterfaceId: pc.interfaces[0].id,
        toNodeId: sw.id,
        toInterfaceId: 'sw-if',
        type: 'cat6',
        status: 'active',
        lengthMeters: 10,
        trafficLoadPct: 0,
      }));

      engine.setNodesAndLinks([sw, ...pcs], presetLinks);
    }
  };

  // Diagnostic AI Assistant Launcher
  const handleOpenAIAssistant = () => {
    const report = diagnoseNetworkState(engine.nodes, engine.links, engine.packetLogs);
    setAiReport(report);
    setShowAIAssistant(true);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="h-screen w-screen bg-[#18181b] p-2 md:p-3 flex font-sans select-none overflow-hidden">
      {/* Structured Left Navigation Sidebar */}
      <SidebarRail
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Main Rounded Content Container */}
      <div className="flex-1 bg-white rounded-[20px] md:rounded-[28px] flex flex-col overflow-hidden border border-slate-100/80">
        {/* Top Navbar */}
        <TopNavbar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          currentSubject={currentSubject}
          setCurrentSubject={() => {}}
          metrics={metrics}
          isPaused={isPaused}
          speedMultiplier={speedMultiplier}
          onTogglePause={() => {
            engine.isPaused = !engine.isPaused;
            setIsPaused(engine.isPaused);
          }}
          onChangeSpeed={(speed) => {
            engine.speedMultiplier = speed;
            setSpeedMultiplier(speed);
          }}
          onOpenAI={handleOpenAIAssistant}
          onOpenSubnetCalc={() => setShowSubnetCalc(true)}
          onOpenSecurity={() => setShowSecurity(true)}
          onOpenAuth={() => setShowAuthModal(true)}
        />

        {/* Main Workspace Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sub-Panels for Networks Arena, Networks Workbench, or TOC Arena */}
          {activeTab === 'toc-arena' ? (
            <TOCMissionPanel
              onLoadMissionPreset={(preset) => {
                setCustomDFAModel(preset);
              }}
              onMissionCompleted={(mId) => {
                const numId = parseInt(mId.replace(/\D/g, '')) || 1;
                recordMissionCompleted(numId, 100);
              }}
            />
          ) : activeTab === 'net-arena' ? (
            <MissionPanel
              missions={missionsList}
              currentMission={currentMission}
              nodes={nodes}
              links={links}
              packetLogs={packetLogs}
              onSelectMission={handleSelectMission}
              onRewardClaimed={(amt) => {
                recordMissionCompleted(currentMission.id, amt);
              }}
              onAddCustomMission={(newMission) => {
                setMissionsList((prev) => [newMission, ...prev]);
              }}
            />
          ) : activeTab === 'net-workbench' ? (
            <SandboxPanel
              nodeCount={nodes.length}
              linkCount={links.length}
              onAddNode={handleAddNode}
              onLoadPreset={handleLoadSandboxPreset}
              onClearCanvas={() => {
                engine.setNodesAndLinks([], []);
                setSelectedNodeId(null);
                setShowNodeConfig(false);
              }}
            />
          ) : null}

          {/* Center Workspace Router */}
          <div className="flex-1 flex flex-col relative overflow-hidden bg-[#fafafa]">
            {/* DATA STRUCTURES & ALGORITHMS (DSA) VIEWS */}
            {activeTab.startsWith('dsa-') ? (
              activeTab === 'dsa-dashboard' ? (
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  {user ? (
                    <UserDashboard currentSubject="DSA" />
                  ) : (
                    <LoginPage onSuccessLogin={() => setActiveTab('dsa-dashboard')} />
                  )}
                </div>
              ) : activeTab === 'dsa-quiz' ? (
                <div className="flex-1 overflow-y-auto p-4">
                  <QuizModal
                    currentSubject="DSA"
                    onCompleteAssessment={(res) =>
                      recordQuizCompleted({
                        type: res.type,
                        topic: 'DSA Algorithmic Assessment',
                        score: res.score,
                        total: res.total,
                        percentage: res.percentage,
                      })
                    }
                  />
                </div>
              ) : (
                <AlgorithmArenaView />
              )
            ) : /* THEORY OF COMPUTATION (TOC) VIEWS */
            activeTab.startsWith('toc-') ? (
              activeTab === 'toc-dashboard' ? (
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  {user ? (
                    <UserDashboard currentSubject="TOC" />
                  ) : (
                    <LoginPage onSuccessLogin={() => setActiveTab('toc-dashboard')} />
                  )}
                </div>
              ) : activeTab === 'toc-quiz' ? (
                <div className="flex-1 overflow-y-auto p-4">
                  <QuizModal
                    currentSubject="TOC"
                    onCompleteAssessment={(res) =>
                      recordQuizCompleted({
                        type: res.type,
                        topic: 'Theory of Computation Assessment',
                        score: res.score,
                        total: res.total,
                        percentage: res.percentage,
                      })
                    }
                  />
                </div>
              ) : (
                <ComputationLabView customDFA={customDFAModel} />
              )
            ) : /* COMPUTER NETWORKS VIEWS */
            activeTab === 'net-dashboard' ? (
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {user ? (
                  <UserDashboard currentSubject="NETWORKS" />
                ) : (
                  <LoginPage onSuccessLogin={() => setActiveTab('net-dashboard')} />
                )}
              </div>
            ) : activeTab === 'net-quiz' ? (
              <div className="flex-1 overflow-y-auto p-4">
                <QuizModal
                  currentSubject="NETWORKS"
                  onCompleteAssessment={(res) =>
                    recordQuizCompleted({
                      type: res.type,
                      topic: 'Networking & Systems Assessment',
                      score: res.score,
                      total: res.total,
                      percentage: res.percentage,
                    })
                  }
                />
              </div>
            ) : (
              <>
                {/* Interactive 2D Topology Canvas for Networks */}
                <div className="flex-1 relative">
                  <TopologyCanvas
                    nodes={nodes}
                    links={links}
                    activeTraces={activeTraces}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={(id) => {
                      setSelectedNodeId(id);
                    }}
                    onOpenNodeConfig={(id) => {
                      setSelectedNodeId(id);
                      setShowNodeConfig(true);
                    }}
                    onAddNode={handleAddNode}
                    onConnectNodes={handleConnectNodes}
                    onDeleteNode={(id) => {
                      engine.setNodesAndLinks(
                        engine.nodes.filter((n) => n.id !== id),
                        engine.links.filter((l) => l.fromNodeId !== id && l.toNodeId !== id)
                      );
                      if (selectedNodeId === id) {
                        setSelectedNodeId(null);
                        setShowNodeConfig(false);
                      }
                    }}
                    onDeleteLink={(id) => {
                      engine.setNodesAndLinks(
                        engine.nodes,
                        engine.links.filter((l) => l.id !== id)
                      );
                    }}
                    onNodeMove={handleNodeMove}
                  />
                </div>

                {/* Bottom Panel: NOC Telemetry & Graphs */}
                <NOCDashboard
                  metrics={metrics}
                  alerts={alerts}
                  packetLogs={packetLogs}
                  onDismissAlert={(id) => {
                    const alert = engine.alerts.find((a) => a.id === id);
                    if (alert) alert.mitigated = true;
                  }}
                />
              </>
            )}
          </div>

          {/* Right Sidebar: Protocol Inspector for Networks */}
          {activeTab.startsWith('net-') && (activeTab === 'net-arena' || activeTab === 'net-workbench') && (
            <ProtocolInspector
              packetLogs={packetLogs}
              onClearLogs={() => {
                engine.packetLogs = [];
                setPacketLogs([]);
              }}
            />
          )}
        </div>
      </div>

      {/* MODALS */}
      {showNodeConfig && selectedNode && (
        <NodeConfigModal
          node={selectedNode}
          allNodes={nodes}
          onClose={() => setShowNodeConfig(false)}
          onUpdateNode={(updated) => {
            const idx = engine.nodes.findIndex((n) => n.id === updated.id);
            if (idx >= 0) engine.nodes[idx] = updated;
            setNodes([...engine.nodes]);
          }}
          onSendPing={(srcId, targetIp) => {
            engine.sendPacket(srcId, targetIp, 'ICMP', { type: 'ICMP_PING_REQ', data: { pingId: 1 } });
          }}
          onSendHttpRequest={(srcId, targetDomain) => {
            const targetServer = engine.nodes.find((n) => n.services?.webServer?.enabled);
            const targetIp = targetServer?.interfaces[0]?.ip || '192.168.1.50';
            engine.sendPacket(srcId, targetIp, 'TCP', { type: 'HTTP_REQUEST', data: { domain: targetDomain } });
          }}
        />
      )}

      {showSubnetCalc && <SubnetCalculatorModal onClose={() => setShowSubnetCalc(false)} />}

      {showAIAssistant && aiReport && (
        <AIAssistantModal
          report={aiReport}
          nodes={nodes}
          links={links}
          packetLogs={packetLogs}
          onClose={() => setShowAIAssistant(false)}
        />
      )}

      {showSecurity && (
        <SecurityCenter
          alerts={alerts}
          nodes={nodes}
          onInjectAttack={(type, targetId) => engine.injectCyberAttack(type, targetId)}
          onMitigateAlert={(id) => {
            const alert = engine.alerts.find((a) => a.id === id);
            if (alert) alert.mitigated = true;
          }}
          onClose={() => setShowSecurity(false)}
        />
      )}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default App;
