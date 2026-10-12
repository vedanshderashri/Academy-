import React, { useRef, useEffect, useState } from 'react';
import { NetworkNode, NetworkLink, PacketTrace, NodeType, LinkType, LINK_SPECS } from '../types/network';
import {
  Plus,
  Cable,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  XCircle,
  Move,
  Settings,
  Trash2,
  Maximize2,
  Minimize2,
  Hand,
} from 'lucide-react';

interface TopologyCanvasProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  activeTraces: PacketTrace[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onOpenNodeConfig: (nodeId: string) => void;
  onAddNode: (type: NodeType) => void;
  onConnectNodes: (fromNodeId: string, toNodeId: string, type: LinkType) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteLink: (linkId: string) => void;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  nodeId: string | null;
}

export const TopologyCanvas: React.FC<TopologyCanvasProps> = ({
  nodes,
  links,
  activeTraces,
  selectedNodeId,
  onSelectNode,
  onOpenNodeConfig,
  onAddNode,
  onConnectNodes,
  onDeleteNode,
  onDeleteLink,
  onNodeMove,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [linkMode, setLinkMode] = useState<boolean>(false);
  const [linkStartNodeId, setLinkStartNodeId] = useState<string | null>(null);
  const [selectedLinkType, setSelectedLinkType] = useState<LinkType>('cat5');
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.0);

  // Workbench Pan / Grab to Move state
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [grabToolActive, setGrabToolActive] = useState<boolean>(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Right-click Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    nodeId: null,
  });

  // Track browser fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error(err));
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.error(err));
    }
  };

  // Resize canvas dynamically with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    window.addEventListener('resize', updateSize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Keyboard shortcut: ESC cancels cable mode / closes context menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLinkMode(false);
        setLinkStartNodeId(null);
        setGrabToolActive(false);
        setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global mouseup / pointerup safety handler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggingNodeId(null);
      setIsPanning(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('pointerup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('pointerup', handleGlobalMouseUp);
    };
  }, []);

  // Canvas Render Loop (60 FPS Light Mode with Panning & Zoom)
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      // #fefefe background
      ctx.fillStyle = '#fefefe';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Background Grid Pattern (Panned & Scaled)
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      const gridSize = 40 * zoom;
      const startX = (panOffset.x % gridSize);
      const startY = (panOffset.y % gridSize);

      for (let x = startX; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = startY; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Apply Canvas Pan & Zoom Transformations
      ctx.translate(panOffset.x, panOffset.y);
      ctx.scale(zoom, zoom);

      // 1. Render Cable Links
      links.forEach((link) => {
        const fromNode = nodes.find((n) => n.id === link.fromNodeId);
        const toNode = nodes.find((n) => n.id === link.toNodeId);

        if (fromNode && toNode) {
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);

          const spec = LINK_SPECS[link.type] || LINK_SPECS.cat5;
          ctx.strokeStyle = link.status === 'congested' ? '#d97706' : spec.color;
          ctx.lineWidth = link.status === 'congested' ? 4 : 2.5;
          if (link.type === 'wireless') {
            ctx.setLineDash([6, 6]);
          } else {
            ctx.setLineDash([]);
          }
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw link bandwidth label
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(midX - 24, midY - 10, 48, 20);
          ctx.strokeStyle = '#cbd5e1';
          ctx.strokeRect(midX - 24, midY - 10, 48, 20);

          ctx.fillStyle = '#475569';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(spec.bandwidthMbps >= 1000 ? `${spec.bandwidthMbps / 1000}G` : `${spec.bandwidthMbps}M`, midX, midY + 3);
        }
      });

      // 2. Render Live Preview Cable in Cable Mode
      if (linkMode && linkStartNodeId) {
        const startNode = nodes.find((n) => n.id === linkStartNodeId);
        if (startNode) {
          ctx.beginPath();
          ctx.moveTo(startNode.x, startNode.y);
          ctx.lineTo(mousePos.x, mousePos.y);
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([8, 8]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // 3. Render In-Flight Packet Dots
      activeTraces.forEach((trace) => {
        const fromNode = nodes.find((n) => n.id === trace.currentNodeId);
        const toNode = nodes.find((n) => n.id === trace.targetNodeId);

        if (fromNode && toNode) {
          const px = fromNode.x + (toNode.x - fromNode.x) * trace.progress;
          const py = fromNode.y + (toNode.y - fromNode.y) * trace.progress;

          let color = '#0284c7'; // Blue for IP
          if (trace.frame.ethertype === 'ARP') color = '#e11d48'; // Red for ARP
          else if (trace.frame.payload?.protocol === 'ICMP') color = '#9333ea'; // Purple ICMP
          else if (trace.frame.payload?.payload.payload.type === 'HTTP_REQUEST') color = '#059669'; // Green HTTP

          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(px, py, 10, 0, Math.PI * 2);
          ctx.strokeStyle = `${color}66`;
          ctx.stroke();
        }
      });

      // 4. Render Nodes
      nodes.forEach((node) => {
        const isSelected = selectedNodeId === node.id;
        const isLinkStart = linkStartNodeId === node.id;

        if (isSelected || isLinkStart) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 36, 0, Math.PI * 2);
          ctx.fillStyle = isLinkStart ? 'rgba(2, 132, 199, 0.2)' : 'rgba(14, 165, 233, 0.15)';
          ctx.fill();
          ctx.strokeStyle = isLinkStart ? '#0284c7' : '#0369a1';
          ctx.lineWidth = isLinkStart ? 3.5 : 2.5;
          ctx.stroke();
        }

        // Node Circle Base
        ctx.beginPath();
        ctx.arc(node.x, node.y, 26, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        let statusColor = '#10b981'; // Green Online
        if (node.status === 'offline') statusColor = '#ef4444';
        else if (node.status === 'congested') statusColor = '#f59e0b';
        else if (node.status === 'attacked') statusColor = '#a855f7';

        ctx.strokeStyle = statusColor;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        let symbol = node.type.toUpperCase().substring(0, 3);
        if (node.type === 'switch') symbol = 'SW';
        else if (node.type === 'router') symbol = 'RT';
        else if (node.type === 'server') symbol = 'SRV';
        else if (node.type === 'firewall') symbol = 'FW';
        else if (node.type === 'load_balancer') symbol = 'LB';
        else if (node.type === 'access_point') symbol = 'AP';
        else if (node.type === 'iot_sensor') symbol = 'IoT';

        ctx.fillText(symbol, node.x, node.y + 4);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.fillText(node.name, node.x, node.y + 40);

        const mainIp = node.interfaces[0]?.ip || 'No IP';
        ctx.fillStyle = '#475569';
        ctx.font = '11px monospace';
        ctx.fillText(mainIp, node.x, node.y + 54);
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [nodes, links, activeTraces, selectedNodeId, linkStartNodeId, linkMode, mousePos, zoom, panOffset]);

  // Pointer Mouse Down (Handles node selection, cable linking, OR grab workbench panning)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (contextMenu.visible) {
      setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
    }

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - panOffset.x) / zoom;
    const canvasY = (e.clientY - rect.top - panOffset.y) / zoom;

    const clickedNode = nodes.find(
      (n) => Math.hypot(n.x - canvasX, n.y - canvasY) <= 38
    );

    // Middle click OR Grab Tool OR Left Click on Background initiates Workbench Pan
    if (e.button === 1 || grabToolActive || (!clickedNode && !linkMode && e.button === 0)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      if (!clickedNode) onSelectNode(null);
      return;
    }

    if (e.button !== 0) return;

    if (linkMode) {
      if (clickedNode) {
        if (!linkStartNodeId) {
          setLinkStartNodeId(clickedNode.id);
        } else if (linkStartNodeId !== clickedNode.id) {
          onConnectNodes(linkStartNodeId, clickedNode.id, selectedLinkType);
          setLinkStartNodeId(null);
        }
      } else {
        setLinkStartNodeId(null);
      }
      return;
    }

    if (clickedNode) {
      onSelectNode(clickedNode.id);
      setDraggingNodeId(clickedNode.id);
      setDragOffset({ x: canvasX - clickedNode.x, y: canvasY - clickedNode.y });
    } else {
      onSelectNode(null);
    }
  };

  // Double Click Handler (Opens Configuration Inspector directly)
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - panOffset.x) / zoom;
    const canvasY = (e.clientY - rect.top - panOffset.y) / zoom;

    const clickedNode = nodes.find(
      (n) => Math.hypot(n.x - canvasX, n.y - canvasY) <= 38
    );

    if (clickedNode) {
      onOpenNodeConfig(clickedNode.id);
    }
  };

  // Right-Click Context Menu Handler
  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - panOffset.x) / zoom;
    const canvasY = (e.clientY - rect.top - panOffset.y) / zoom;

    const clickedNode = nodes.find(
      (n) => Math.hypot(n.x - canvasX, n.y - canvasY) <= 38
    );

    if (clickedNode) {
      onSelectNode(clickedNode.id);
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        nodeId: clickedNode.id,
      });
    } else {
      setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();

    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    const canvasX = (e.clientX - rect.left - panOffset.x) / zoom;
    const canvasY = (e.clientY - rect.top - panOffset.y) / zoom;

    setMousePos({ x: canvasX, y: canvasY });

    if (draggingNodeId) {
      onNodeMove(draggingNodeId, Math.max(30, canvasX - dragOffset.x), Math.max(30, canvasY - dragOffset.y));
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  const resetPanAndZoom = () => {
    setZoom(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  const startNodeName = nodes.find((n) => n.id === linkStartNodeId)?.name;
  const contextNode = nodes.find((n) => n.id === contextMenu.nodeId);

  return (
    <div
      className="relative w-full h-full bg-[#fefefe] overflow-hidden flex flex-col font-sans select-none"
      ref={containerRef}
    >
      {/* Cable Connect Active Banner Notification */}
      {linkMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-cyan-900 text-white px-4 py-2 rounded-xl flex items-center gap-3 text-xs font-bold animate-bounce">
          <Cable className="w-4 h-4 text-cyan-300" />
          <span>
            {linkStartNodeId
              ? `NODE 1 SELECTED (${startNodeName}). Now click Node 2 to connect cable!`
              : 'CONNECT CABLE MODE ACTIVE: Click Node 1 to start cable'}
          </span>
          <button
            onClick={() => {
              setLinkMode(false);
              setLinkStartNodeId(null);
            }}
            className="p-1 hover:bg-cyan-800 rounded text-cyan-200"
            title="Cancel Cable Mode (Esc)"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Topology Canvas Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-white/90 backdrop-blur border border-slate-200 p-2 rounded-xl">
        {/* Device Adder Buttons */}
        <div className="flex items-center space-x-1 border-r border-slate-200 pr-2">
          <button
            onClick={() => onAddNode('pc')}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-cyan-50 text-cyan-700 border border-slate-200 hover:border-cyan-400 rounded-lg text-xs font-semibold transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> +PC
          </button>
          <button
            onClick={() => onAddNode('switch')}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-cyan-50 text-cyan-700 border border-slate-200 hover:border-cyan-400 rounded-lg text-xs font-semibold transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> +Switch
          </button>
          <button
            onClick={() => onAddNode('router')}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-cyan-50 text-cyan-700 border border-slate-200 hover:border-cyan-400 rounded-lg text-xs font-semibold transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> +Router
          </button>
          <button
            onClick={() => onAddNode('server')}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-cyan-50 text-cyan-700 border border-slate-200 hover:border-cyan-400 rounded-lg text-xs font-semibold transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> +Server
          </button>
          <button
            onClick={() => onAddNode('firewall')}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-cyan-50 text-cyan-700 border border-slate-200 hover:border-cyan-400 rounded-lg text-xs font-semibold transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> +Firewall
          </button>
          <button
            onClick={() => onAddNode('load_balancer')}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-cyan-50 text-cyan-700 border border-slate-200 hover:border-cyan-400 rounded-lg text-xs font-semibold transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> +LB
          </button>
        </div>

        {/* Cable Connection Mode */}
        <div className="flex items-center space-x-2 border-r border-slate-200 pr-2">
          <select
            value={selectedLinkType}
            onChange={(e) => setSelectedLinkType(e.target.value as LinkType)}
            className="bg-white border border-slate-300 text-xs text-slate-800 font-bold rounded-lg px-2 py-1.5 focus:outline-none"
          >
            <option value="cat5">Cat5 (100Mbps)</option>
            <option value="cat6">Cat6 (1Gbps)</option>
            <option value="fiber">Fiber (10Gbps)</option>
            <option value="wireless">Wi-Fi (300Mbps)</option>
          </select>

          <button
            onClick={() => {
              setLinkMode(!linkMode);
              setLinkStartNodeId(null);
              setGrabToolActive(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              linkMode ? 'bg-amber-600 text-white animate-pulse' : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            <Cable className="w-4 h-4" />
            {linkMode ? (linkStartNodeId ? 'Select Target Node' : 'Click Node 1') : 'Connect Cable'}
          </button>
        </div>

        {/* Grab Workbench Tool Toggle */}
        <button
          onClick={() => {
            setGrabToolActive(!grabToolActive);
            setLinkMode(false);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
            grabToolActive
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
          title="Grab Workbench Tool (Click & drag canvas to move)"
        >
          <Hand className="w-4 h-4" />
          <span>{grabToolActive ? 'Grab Tool Active' : 'Grab Workbench'}</span>
        </button>
      </div>

      {/* Canvas Zoom & Fullscreen Floating Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center space-x-1 bg-white/90 border border-slate-200 p-1.5 rounded-xl">
        <button
          onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono px-2 text-slate-700 font-bold">{Math.round(zoom * 100)}%</span>

        <button
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={resetPanAndZoom}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
          title="Reset Zoom & Pan"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-slate-200 mx-1"></div>

        {/* FULLSCREEN WORKBENCH TOGGLE BUTTON */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 bg-slate-100 hover:bg-cyan-600 hover:text-white rounded text-slate-700 font-bold transition flex items-center gap-1 text-xs"
          title={isFullscreen ? 'Exit Fullscreen Workbench' : 'Fullscreen Workbench'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
        </button>
      </div>

      {/* Main Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`w-full h-full ${
          isPanning
            ? 'cursor-grabbing'
            : grabToolActive
            ? 'cursor-grab'
            : 'cursor-crosshair'
        }`}
      />

      {/* Custom Right-Click Context Menu */}
      {contextMenu.visible && contextNode && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 bg-white border border-slate-200 rounded-xl py-1.5 w-52 text-xs font-sans select-none animate-in fade-in duration-100"
        >
          {/* Node Header */}
          <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50">
            <span className="font-bold text-slate-900 block truncate">{contextNode.name}</span>
            <span className="text-[10px] text-slate-500 font-mono">
              {contextNode.type.toUpperCase()} • {contextNode.interfaces[0]?.ip || 'No IP'}
            </span>
          </div>

          {/* Option 1: Move */}
          <button
            onClick={() => {
              setDraggingNodeId(contextNode.id);
              setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
            }}
            className="w-full text-left px-3 py-2 hover:bg-cyan-50 text-slate-800 hover:text-cyan-900 flex items-center gap-2 font-semibold"
          >
            <Move className="w-4 h-4 text-cyan-600" />
            <span>1. Move Device</span>
          </button>

          {/* Option 2: Configure */}
          <button
            onClick={() => {
              onOpenNodeConfig(contextNode.id);
              setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
            }}
            className="w-full text-left px-3 py-2 hover:bg-cyan-50 text-slate-800 hover:text-cyan-900 flex items-center gap-2 font-semibold"
          >
            <Settings className="w-4 h-4 text-cyan-600" />
            <span>2. Configure Settings</span>
          </button>

          {/* Option 3: Connect with other */}
          <button
            onClick={() => {
              setLinkMode(true);
              setLinkStartNodeId(contextNode.id);
              setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
            }}
            className="w-full text-left px-3 py-2 hover:bg-cyan-50 text-slate-800 hover:text-cyan-900 flex items-center gap-2 font-semibold border-b border-slate-100"
          >
            <Cable className="w-4 h-4 text-cyan-600" />
            <span>3. Connect with other</span>
          </button>

          {/* Option 4: Delete */}
          <button
            onClick={() => {
              onDeleteNode(contextNode.id);
              setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
            }}
            className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2 font-semibold"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Delete Device</span>
          </button>
        </div>
      )}
    </div>
  );
};
