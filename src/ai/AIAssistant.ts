import { NetworkNode, NetworkLink, PacketTrace } from '../types/network';
import { isIpInSubnet, maskToCidr } from '../simulation/protocols/SubnetMath';

export interface AIDiagnosticReport {
  issueFound: boolean;
  summary: string;
  rootCauses: string[];
  recommendations: string[];
  affectedNodeIds: string[];
}

export function diagnoseNetworkState(
  nodes: NetworkNode[],
  links: NetworkLink[],
  packetLogs: PacketTrace[]
): AIDiagnosticReport {
  const rootCauses: string[] = [];
  const recommendations: string[] = [];
  const affectedNodeIds: string[] = [];

  // 1. Check for disconnected nodes
  nodes.forEach((node) => {
    const hasLink = links.some(
      (l) => l.status === 'active' && (l.fromNodeId === node.id || l.toNodeId === node.id)
    );
    if (!hasLink) {
      rootCauses.push(`Node '${node.name}' (${node.type.toUpperCase()}) has no connected active cable.`);
      recommendations.push(`Use the Cable tool to connect '${node.name}' to a Switch or Router.`);
      affectedNodeIds.push(node.id);
    }
  });

  // 2. Check for missing IP addresses or subnet mismatches
  const hosts = nodes.filter((n) => n.type === 'pc' || n.type === 'laptop' || n.type === 'server');
  hosts.forEach((host) => {
    const iface = host.interfaces[0];
    if (iface) {
      if (!iface.ip || iface.ip === '0.0.0.0') {
        rootCauses.push(`Host '${host.name}' has no IP address configured.`);
        recommendations.push(`Configure static IP or enable DHCP Client on '${host.name}'.`);
        affectedNodeIds.push(host.id);
      }
    }
  });

  // 3. Check for dropped packets in packet trace history
  const recentDrops = packetLogs.filter((p) => p.status === 'DROPPED' || p.status === 'BLOCKED');
  if (recentDrops.length > 0) {
    const sampleDrop = recentDrops[0];
    rootCauses.push(`Packets are failing in transit! Reason: ${sampleDrop.dropReason || 'Unknown Drop'}`);
    recommendations.push(`Inspect routing tables, firewall ACL rules, and default gateway configurations.`);
    affectedNodeIds.push(sampleDrop.sourceNodeId, sampleDrop.targetNodeId);
  }

  // 4. Check for link congestion
  const congestedLinks = links.filter((l) => l.trafficLoadPct > 80);
  if (congestedLinks.length > 0) {
    rootCauses.push(`${congestedLinks.length} network link(s) are experiencing heavy congestion (>80% capacity).`);
    recommendations.push(`Upgrade cable bandwidth from Cat5 (100Mbps) to Cat6 (1Gbps) or Fiber (10Gbps).`);
  }

  const issueFound = rootCauses.length > 0;

  return {
    issueFound,
    summary: issueFound
      ? `AI Engineer identified ${rootCauses.length} network issue(s) requiring attention.`
      : 'Network operations normal. All links, routing paths, and host configurations are functioning cleanly.',
    rootCauses,
    recommendations,
    affectedNodeIds: Array.from(new Set(affectedNodeIds)),
  };
}
