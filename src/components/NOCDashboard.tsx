import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { NOCMetrics, SecurityAlert, PacketTrace } from '../types/network';
import { Activity, Wifi, ArrowDownUp, AlertTriangle } from 'lucide-react';

interface NOCDashboardProps {
  metrics: NOCMetrics;
  alerts: SecurityAlert[];
  packetLogs: PacketTrace[];
  onDismissAlert: (id: string) => void;
}

interface TelemetryPoint {
  time: string;
  throughput: number;
  latency: number;
  packetLoss: number;
  activePackets: number;
}

export const NOCDashboard: React.FC<NOCDashboardProps> = ({
  metrics,
  alerts,
  packetLogs,
  onDismissAlert,
}) => {
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const metricsRef = useRef(metrics);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  // Smooth 1-second interval telemetry sampler for clean real-time charts
  useEffect(() => {
    const interval = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString().split(' ')[0];
      const m = metricsRef.current;
      const newPoint: TelemetryPoint = {
        time: timeStr,
        throughput: m.throughputMbps,
        latency: m.averageLatencyMs,
        packetLoss: m.packetLossPercentage,
        activePackets: m.activePacketsCount,
      };

      setHistory((prev) => {
        const next = [...prev, newPoint];
        if (next.length > 20) next.shift(); // Keep last 20 seconds
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#fefefe] border-t border-slate-200 p-4 text-slate-900 flex flex-col space-y-4 max-h-[350px] overflow-y-auto">
      {/* Metrics Header Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-500 block font-semibold">THROUGHPUT</span>
            <span className="text-lg font-bold text-cyan-700 font-mono">
              {metrics.throughputMbps} Mbps
            </span>
          </div>
          <ArrowDownUp className="w-5 h-5 text-cyan-600 opacity-80" />
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-500 block font-semibold">AVG LATENCY</span>
            <span className="text-lg font-bold text-emerald-700 font-mono">
              {metrics.averageLatencyMs} ms
            </span>
          </div>
          <Wifi className="w-5 h-5 text-emerald-600 opacity-80" />
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-500 block font-semibold">PACKET LOSS</span>
            <span className="text-lg font-bold text-rose-600 font-mono">
              {metrics.packetLossPercentage}%
            </span>
          </div>
          <AlertTriangle className="w-5 h-5 text-rose-600 opacity-80" />
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-500 block font-semibold">ACTIVE PACKETS</span>
            <span className="text-lg font-bold text-purple-700 font-mono">
              {metrics.activePacketsCount}
            </span>
          </div>
          <Activity className="w-5 h-5 text-purple-600 opacity-80" />
        </div>
      </div>

      {/* Real-Time Telemetry Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chart 1: Network Throughput (Mbps) */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col h-[180px] shadow-xs">
          <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-600" />
            Live Network Throughput (Mbps)
          </h4>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="throughput" stroke="#0891b2" strokeWidth={2} fillOpacity={1} fill="url(#colorThroughput)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Latency (ms) & Packet Loss */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col h-[180px] shadow-xs">
          <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            Network Latency (ms) & Loss Rate (%)
          </h4>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="latency" stroke="#059669" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="packetLoss" stroke="#e11d48" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
