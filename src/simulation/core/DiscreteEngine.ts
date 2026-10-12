import {
  NetworkNode,
  NetworkLink,
  PacketTrace,
  FrameL2,
  PacketL3,
  SegmentL4,
  ApplicationL7,
  NOCMetrics,
  SecurityAlert,
  FirewallRule,
  DNSRecord,
} from '../../types/network';
import { getNetworkAddress, isIpInSubnet, maskToCidr } from '../protocols/SubnetMath';
import { computeDijkstraRoutes, lookupLongestPrefixRoute } from '../protocols/RoutingAlgorithms';

export class DiscreteEngine {
  public nodes: NetworkNode[] = [];
  public links: NetworkLink[] = [];
  public activeTraces: PacketTrace[] = [];
  public packetLogs: PacketTrace[] = [];
  public alerts: SecurityAlert[] = [];

  public metrics: NOCMetrics = {
    activePacketsCount: 0,
    totalPacketsProcessed: 0,
    throughputMbps: 0,
    averageLatencyMs: 0,
    packetLossPercentage: 0,
    droppedPacketsCount: 0,
    securityAlertsCount: 0,
    networkUptimePercentage: 100,
    totalBudget: 15000,
    monthlyCost: 450,
  };

  public isPaused: boolean = false;
  public speedMultiplier: number = 1.0;
  public simTimeMs: number = 0;
  private lastAutoTrafficTick: number = 0;

  private listeners: Set<() => void> = new Set();

  constructor(nodes: NetworkNode[] = [], links: NetworkLink[] = []) {
    this.nodes = nodes;
    this.links = links;
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public setNodesAndLinks(nodes: NetworkNode[], links: NetworkLink[]) {
    this.nodes = nodes;
    this.links = links;
    this.notify();
  }

  // --- ENGINE TICK LOOP ---
  public tick(deltaTimeMs: number = 50) {
    if (this.isPaused) return;

    const effDelta = deltaTimeMs * this.speedMultiplier;
    this.simTimeMs += effDelta;

    // 1. Update dynamic routing tables (Dijkstra) for routers periodically
    if (Math.floor(this.simTimeMs / 1000) % 5 === 0) {
      this.recalculateDynamicRouting();
    }

    // 2. Generate Continuous Background Real-Time Traffic between connected nodes
    if (this.simTimeMs - this.lastAutoTrafficTick >= 1500) {
      this.lastAutoTrafficTick = this.simTimeMs;
      this.generateBackgroundTraffic();
    }

    // 3. Process active packet traces in flight
    const remainingTraces: PacketTrace[] = [];
    let deliveredInTick = 0;
    let droppedInTick = 0;

    for (const trace of this.activeTraces) {
      if (trace.status !== 'IN_FLIGHT') {
        continue;
      }

      // Calculate speed along cable
      const link = this.links.find((l) => l.id === trace.linkId);
      const linkSpeed = link ? (link.type === 'fiber' ? 0.08 : 0.04) : 0.05;

      trace.progress += linkSpeed * this.speedMultiplier;

      if (trace.progress >= 1.0) {
        // Packet arrived at target node
        trace.progress = 1.0;
        const targetNode = this.nodes.find((n) => n.id === trace.targetNodeId);

        if (!targetNode || targetNode.status === 'offline') {
          trace.status = 'DROPPED';
          trace.dropReason = 'Destination node offline or unreachable';
          droppedInTick++;
        } else {
          // Process at target node
          const success = this.processPacketAtNode(trace, targetNode);
          if (success) {
            deliveredInTick++;
          } else {
            droppedInTick++;
          }
        }
        this.packetLogs.unshift({ ...trace });
        if (this.packetLogs.length > 200) this.packetLogs.pop();
      } else {
        remainingTraces.push(trace);
      }
    }

    this.activeTraces = remainingTraces;

    // 4. Update Link load metrics
    this.updateLinkLoads();

    // 5. Update overall NOC telemetry metrics
    const totalProcessed = this.metrics.totalPacketsProcessed + deliveredInTick + droppedInTick;
    const totalDropped = this.metrics.droppedPacketsCount + droppedInTick;
    const lossPct = totalProcessed > 0 ? (totalDropped / totalProcessed) * 100 : 0;

    // Real-time Throughput Calculation
    const activeThroughput =
      this.activeTraces.length > 0 || deliveredInTick > 0
        ? parseFloat((1.2 + this.activeTraces.length * 1.5 + Math.random() * 0.8).toFixed(2))
        : 0;

    this.metrics = {
      ...this.metrics,
      activePacketsCount: this.activeTraces.length,
      totalPacketsProcessed: totalProcessed,
      droppedPacketsCount: totalDropped,
      packetLossPercentage: parseFloat(lossPct.toFixed(1)),
      throughputMbps: activeThroughput,
      averageLatencyMs: this.activeTraces.length > 0 ? Math.round(14 + Math.random() * 6) : 0,
      securityAlertsCount: this.alerts.filter((a) => !a.mitigated).length,
    };

    this.notify();
  }

  // --- AUTOMATIC BACKGROUND REAL-TIME TRAFFIC GENERATOR ---
  private generateBackgroundTraffic() {
    if (this.nodes.length < 2 || this.links.length === 0) return;

    // Find host devices
    const clientNodes = this.nodes.filter(
      (n) => (n.type === 'pc' || n.type === 'laptop' || n.type === 'iot_sensor') && n.status === 'online'
    );
    const targetNodes = this.nodes.filter(
      (n) => (n.type === 'server' || n.type === 'pc' || n.type === 'router') && n.status === 'online'
    );

    if (clientNodes.length === 0 || targetNodes.length === 0) return;

    const randomClient = clientNodes[Math.floor(Math.random() * clientNodes.length)];
    let randomTarget = targetNodes[Math.floor(Math.random() * targetNodes.length)];
    if (randomClient.id === randomTarget.id) return;

    const targetIp = randomTarget.interfaces[0]?.ip;
    if (!targetIp || targetIp === '0.0.0.0') return;

    // Send ICMP Ping or HTTP Request background pulse
    if (randomTarget.type === 'server' && randomTarget.services?.webServer?.enabled) {
      this.sendPacket(randomClient.id, targetIp, 'TCP', {
        type: 'HTTP_REQUEST',
        data: { domain: 'www.tycoon.com' },
      });
    } else {
      this.sendPacket(randomClient.id, targetIp, 'ICMP', {
        type: 'ICMP_PING_REQ',
        data: { pingId: Math.floor(Math.random() * 100) },
      });
    }
  }

  // --- DIJKSTRA ROUTING CALCULATION ---
  public recalculateDynamicRouting() {
    this.nodes.forEach((node) => {
      if (node.type === 'router') {
        const dijkstraRoutes = computeDijkstraRoutes(node.id, this.nodes, this.links);
        // Keep static routes and replace dynamic ones
        const staticRoutes = node.routingTable.filter((r) => r.type === 'STATIC' || r.type === 'DIRECT');
        node.routingTable = [...staticRoutes, ...dijkstraRoutes];
      }
    });
  }

  // --- PACKET DISPATCH / TRANSMISSION ---
  public sendPacket(
    sourceNodeId: string,
    targetIp: string,
    protocol: 'ICMP' | 'TCP' | 'UDP',
    appPayload: ApplicationL7,
    srcPort: number = 8080,
    dstPort: number = 80
  ) {
    const srcNode = this.nodes.find((n) => n.id === sourceNodeId);
    if (!srcNode || srcNode.status === 'offline') return null;

    const srcIface = srcNode.interfaces[0];
    if (!srcIface) return null;

    // Check ARP Cache
    let targetMac = 'FF:FF:FF:FF:FF:FF'; // Default broadcast
    const arpMatch = srcNode.arpCache.find((a) => a.ip === targetIp);

    if (arpMatch) {
      targetMac = arpMatch.mac;
    } else if (protocol !== 'ICMP' && appPayload.type !== 'DHCP_DISCOVER') {
      // Trigger ARP request first if IP is local subnet
      if (isIpInSubnet(targetIp, `${srcIface.ip}/${maskToCidr(srcIface.subnetMask)}`)) {
        this.broadcastArpRequest(srcNode, targetIp);
      }
    }

    const frame: FrameL2 = {
      srcMac: srcIface.mac,
      dstMac: targetMac,
      vlanId: srcIface.vlanId || 1,
      ethertype: 'IP',
      payload: {
        srcIp: srcIface.ip,
        dstIp: targetIp,
        ttl: 64,
        protocol,
        payload: {
          srcPort,
          dstPort,
          protocol,
          seqNumber: Math.floor(Math.random() * 10000),
          ackNumber: 0,
          flags: appPayload.type === 'HTTP_REQUEST' ? { syn: true, ack: false, fin: false, rst: false } : undefined,
          payload: appPayload,
        },
      },
    };

    // Find ALL active links connected to source node
    const activeConnectedLinks = this.links.filter(
      (l) => l.status === 'active' && (l.fromNodeId === srcNode.id || l.toNodeId === srcNode.id)
    );

    if (activeConnectedLinks.length === 0) {
      return null;
    }

    // Forward packet out on connected link(s)
    activeConnectedLinks.forEach((link) => {
      const targetNodeId = link.fromNodeId === srcNode.id ? link.toNodeId : link.fromNodeId;
      const trace: PacketTrace = {
        id: `pkt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: Date.now(),
        sourceNodeId: srcNode.id,
        targetNodeId,
        currentNodeId: srcNode.id,
        progress: 0.0,
        linkId: link.id,
        frame,
        status: 'IN_FLIGHT',
      };
      this.activeTraces.push(trace);
    });

    return true;
  }

  // --- ARP BROADCAST ---
  private broadcastArpRequest(srcNode: NetworkNode, targetIp: string) {
    const srcIface = srcNode.interfaces[0];
    if (!srcIface) return;

    const frame: FrameL2 = {
      srcMac: srcIface.mac,
      dstMac: 'FF:FF:FF:FF:FF:FF',
      vlanId: srcIface.vlanId || 1,
      ethertype: 'ARP',
      arpData: {
        op: 'REQUEST',
        senderMac: srcIface.mac,
        senderIp: srcIface.ip,
        targetMac: '00:00:00:00:00:00',
        targetIp,
      },
    };

    const connectedLinks = this.links.filter(
      (l) => l.status === 'active' && (l.fromNodeId === srcNode.id || l.toNodeId === srcNode.id)
    );

    connectedLinks.forEach((link) => {
      const targetNodeId = link.fromNodeId === srcNode.id ? link.toNodeId : link.fromNodeId;
      this.activeTraces.push({
        id: `arp-req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: Date.now(),
        sourceNodeId: srcNode.id,
        targetNodeId,
        currentNodeId: srcNode.id,
        progress: 0.0,
        linkId: link.id,
        frame,
        status: 'IN_FLIGHT',
      });
    });
  }

  // --- PACKET PROCESSING AT NODE ---
  private processPacketAtNode(trace: PacketTrace, node: NetworkNode): boolean {
    // Check Firewall Rules at Node / Firewall
    if (node.firewallRules && node.firewallRules.length > 0 && trace.frame.payload) {
      const pkt = trace.frame.payload;
      const blockedRule = node.firewallRules.find((rule) => {
        if (rule.action === 'DENY') {
          const protoMatch = rule.protocol === 'ANY' || rule.protocol === pkt.protocol;
          const portMatch = !rule.dstPort || rule.dstPort === pkt.payload.dstPort;
          const ipMatch = rule.srcCIDR === '0.0.0.0/0' || isIpInSubnet(pkt.srcIp, rule.srcCIDR);
          return protoMatch && portMatch && ipMatch;
        }
        return false;
      });

      if (blockedRule) {
        trace.status = 'BLOCKED';
        trace.dropReason = `Blocked by Firewall Rule: ${blockedRule.description}`;
        this.alerts.unshift({
          id: `fw-${Date.now()}`,
          timestamp: Date.now(),
          severity: 'warning',
          title: 'Firewall Dropped Packet',
          message: `Firewall ${node.name} denied ${pkt.protocol} packet from ${pkt.srcIp} to port ${pkt.payload.dstPort}`,
          sourceNodeId: node.id,
          mitigated: false,
        });
        return false;
      }
    }

    // 1. SWITCH NODE BEHAVIOR (L2 MAC Address Table Learning & Forwarding)
    if (node.type === 'switch') {
      const incomingPort = trace.linkId || '';

      // Learn MAC address
      if (trace.frame.srcMac && trace.frame.srcMac !== 'FF:FF:FF:FF:FF:FF') {
        const existingEntry = node.macTable.find((m) => m.mac === trace.frame.srcMac);
        if (existingEntry) {
          existingEntry.ageSeconds = 0;
          existingEntry.portId = incomingPort;
        } else {
          node.macTable.push({
            mac: trace.frame.srcMac,
            portId: incomingPort,
            vlanId: trace.frame.vlanId || 1,
            ageSeconds: 0,
          });
        }
      }

      // Check if unicast destination MAC is in MAC Table
      const macEntry = node.macTable.find((m) => m.mac === trace.frame.dstMac);

      if (macEntry && trace.frame.dstMac !== 'FF:FF:FF:FF:FF:FF') {
        // Forward directly to matching port link
        const targetLink = this.links.find(
          (l) => l.id === macEntry.portId && l.status === 'active' && l.id !== incomingPort
        );
        if (targetLink) {
          const nextNodeId = targetLink.fromNodeId === node.id ? targetLink.toNodeId : targetLink.fromNodeId;
          this.activeTraces.push({
            ...trace,
            id: `pkt-fwd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            currentNodeId: node.id,
            targetNodeId: nextNodeId,
            linkId: targetLink.id,
            progress: 0.0,
            status: 'IN_FLIGHT',
          });
          return true;
        }
      }

      // Broadcast / Flooding to all ports except incoming port
      const otherLinks = this.links.filter(
        (l) => l.status === 'active' && (l.fromNodeId === node.id || l.toNodeId === node.id) && l.id !== incomingPort
      );

      otherLinks.forEach((l) => {
        const nextNodeId = l.fromNodeId === node.id ? l.toNodeId : l.fromNodeId;
        this.activeTraces.push({
          ...trace,
          id: `pkt-flood-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          currentNodeId: node.id,
          targetNodeId: nextNodeId,
          linkId: l.id,
          progress: 0.0,
          status: 'IN_FLIGHT',
        });
      });

      return true;
    }

    // 2. ROUTER NODE BEHAVIOR (L3 Forwarding via Routing Table)
    if (node.type === 'router' || node.type === 'firewall') {
      if (trace.frame.ethertype === 'IP' && trace.frame.payload) {
        const pkt = trace.frame.payload;

        // Check TTL
        if (pkt.ttl <= 1) {
          trace.status = 'DROPPED';
          trace.dropReason = 'TTL Expired in Transit';
          return false;
        }

        pkt.ttl -= 1;

        // Routing Table Lookup using Longest Prefix Match (LPM)
        const route = lookupLongestPrefixRoute(pkt.dstIp, node.routingTable);

        if (route) {
          // Find next link based on route interfaceId or nextHop
          let targetLink = this.links.find((l) => l.id === route.interfaceId && l.status === 'active');

          if (!targetLink) {
            targetLink = this.links.find(
              (l) =>
                l.status === 'active' &&
                (l.fromNodeId === node.id || l.toNodeId === node.id) &&
                l.id !== trace.linkId
            );
          }

          if (targetLink) {
            const nextNodeId = targetLink.fromNodeId === node.id ? targetLink.toNodeId : targetLink.fromNodeId;
            this.activeTraces.push({
              ...trace,
              id: `router-fwd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              currentNodeId: node.id,
              targetNodeId: nextNodeId,
              linkId: targetLink.id,
              progress: 0.0,
              status: 'IN_FLIGHT',
            });
            return true;
          }
        }

        trace.status = 'DROPPED';
        trace.dropReason = `No route to host ${pkt.dstIp} in router table`;
        return false;
      }
    }

    // 3. ARP HANDLING AT END HOST / SERVER
    if (trace.frame.ethertype === 'ARP' && trace.frame.arpData) {
      const arp = trace.frame.arpData;
      const myIface = node.interfaces.find((i) => i.ip === arp.targetIp);

      if (arp.op === 'REQUEST' && myIface) {
        // Learn requester MAC
        node.arpCache.push({ ip: arp.senderIp, mac: arp.senderMac, ttlSeconds: 300 });

        // Send ARP Reply back on incoming link
        const replyFrame: FrameL2 = {
          srcMac: myIface.mac,
          dstMac: arp.senderMac,
          ethertype: 'ARP',
          arpData: {
            op: 'REPLY',
            senderMac: myIface.mac,
            senderIp: myIface.ip,
            targetMac: arp.senderMac,
            targetIp: arp.senderIp,
          },
        };

        const replyLink = this.links.find((l) => l.id === trace.linkId && l.status === 'active');
        if (replyLink) {
          const senderNodeId = replyLink.fromNodeId === node.id ? replyLink.toNodeId : replyLink.fromNodeId;
          this.activeTraces.push({
            id: `arp-reply-${Date.now()}`,
            timestamp: Date.now(),
            sourceNodeId: node.id,
            targetNodeId: senderNodeId,
            currentNodeId: node.id,
            progress: 0.0,
            linkId: replyLink.id,
            frame: replyFrame,
            status: 'IN_FLIGHT',
          });
        }
      } else if (arp.op === 'REPLY') {
        node.arpCache.push({ ip: arp.senderIp, mac: arp.senderMac, ttlSeconds: 300 });
      }

      trace.status = 'DELIVERED';
      return true;
    }

    // 4. END HOST APPLICATION SERVICES (DNS, DHCP, HTTP, ICMP)
    if (trace.frame.payload) {
      const pkt = trace.frame.payload;
      const app = pkt.payload.payload;

      // ICMP PING
      if (app.type === 'ICMP_PING_REQ') {
        trace.status = 'DELIVERED';
        this.sendPacket(node.id, pkt.srcIp, 'ICMP', {
          type: 'ICMP_PING_REPLY',
          data: { pingId: app.data.pingId, roundtripTimeMs: 14 },
        });
        return true;
      }

      // DNS QUERY
      if (app.type === 'DNS_QUERY' && node.services?.dnsServer?.enabled) {
        const queryDomain = app.data.domain;
        const records = node.services.dnsServer.records || [];
        const match = records.find((r) => r.domain.toLowerCase() === queryDomain.toLowerCase());

        trace.status = 'DELIVERED';
        this.sendPacket(node.id, pkt.srcIp, 'UDP', {
          type: 'DNS_RESPONSE',
          data: { domain: queryDomain, ip: match ? match.ip : '0.0.0.0', found: !!match },
        });
        return true;
      }

      // HTTP REQUEST
      if (app.type === 'HTTP_REQUEST' && node.services?.webServer?.enabled) {
        node.services.webServer.requestCount = (node.services.webServer.requestCount || 0) + 1;
        trace.status = 'DELIVERED';
        this.sendPacket(node.id, pkt.srcIp, 'TCP', {
          type: 'HTTP_RESPONSE',
          data: {
            statusCode: 200,
            statusText: '200 OK',
            body: node.services.webServer.rootPage || '<h1>Welcome to Network Tycoon Web Server</h1>',
          },
        });
        return true;
      }

      // DHCP DISCOVER
      if (app.type === 'DHCP_DISCOVER' && node.services?.dhcpServer?.enabled) {
        const pool = node.services.dhcpServer;
        const allocatedIp = pool.startIp || '192.168.1.100';
        trace.status = 'DELIVERED';
        this.sendPacket(node.id, '255.255.255.255', 'UDP', {
          type: 'DHCP_OFFER',
          data: {
            offeredIp: allocatedIp,
            subnetMask: '255.255.255.0',
            gateway: pool.gateway || node.interfaces[0]?.ip,
            dnsServer: pool.dnsServer || node.interfaces[0]?.ip,
          },
        });
        return true;
      }

      // ATTACK PROBES & IDS MONITORS
      if (app.type.startsWith('ATTACK_')) {
        node.status = 'attacked';
        this.alerts.unshift({
          id: `ids-${Date.now()}`,
          timestamp: Date.now(),
          severity: 'critical',
          title: `CYBER ATTACK DETECTED: ${app.type}`,
          message: `Node ${node.name} received malicious probe from ${pkt.srcIp}`,
          sourceNodeId: trace.sourceNodeId,
          targetNodeId: node.id,
          mitigated: false,
        });
      }

      trace.status = 'DELIVERED';
      return true;
    }

    trace.status = 'DELIVERED';
    return true;
  }

  private updateLinkLoads() {
    this.links.forEach((link) => {
      const packetsOnLink = this.activeTraces.filter((t) => t.linkId === link.id).length;
      link.trafficLoadPct = Math.min(100, packetsOnLink * 20);
      if (link.trafficLoadPct > 80) {
        link.status = 'congested';
      } else if (link.status === 'congested') {
        link.status = 'active';
      }
    });
  }

  // --- CYBER ATTACK INJECTION (RED TEAM) ---
  public injectCyberAttack(
    attackType: 'ATTACK_PORT_SCAN' | 'ATTACK_DDOS' | 'ATTACK_ARP_SPOOF',
    targetNodeId: string
  ) {
    const targetNode = this.nodes.find((n) => n.id === targetNodeId);
    if (!targetNode) return;

    const attackerNode = this.nodes.find((n) => n.id !== targetNodeId);
    if (!attackerNode) return;

    if (attackType === 'ATTACK_DDOS') {
      // Send 15 high-rate packet bursts
      for (let i = 0; i < 15; i++) {
        setTimeout(() => {
          this.sendPacket(attackerNode.id, targetNode.interfaces[0]?.ip || '192.168.1.1', 'UDP', {
            type: 'ATTACK_DDOS',
            data: { payloadSize: 65535, attackVector: 'UDP Flood' },
          });
        }, i * 50);
      }
    } else {
      this.sendPacket(attackerNode.id, targetNode.interfaces[0]?.ip || '192.168.1.1', 'TCP', {
        type: attackType,
        data: { targetPort: 80, technique: attackType },
      });
    }
  }
}
