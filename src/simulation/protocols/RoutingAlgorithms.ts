import { NetworkNode, NetworkLink, RouteEntry } from '../../types/network';
import { isIpInSubnet, maskToCidr } from './SubnetMath';

export function computeDijkstraRoutes(
  sourceNodeId: string,
  nodes: NetworkNode[],
  links: NetworkLink[]
): RouteEntry[] {
  const nodeMap = new Map<string, NetworkNode>(nodes.map((n) => [n.id, n]));
  const distances = new Map<string, number>();
  const previousNode = new Map<string, { nodeId: string; linkId: string }>();

  nodes.forEach((n) => distances.set(n.id, Infinity));
  distances.set(sourceNodeId, 0);

  const unvisited = new Set<string>(nodes.map((n) => n.id));

  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let smallestDist = Infinity;
    for (const nodeId of unvisited) {
      const d = distances.get(nodeId) || Infinity;
      if (d < smallestDist) {
        smallestDist = d;
        currentId = nodeId;
      }
    }

    if (!currentId || smallestDist === Infinity) break;
    unvisited.delete(currentId);

    // Find outgoing active links
    const activeLinks = links.filter(
      (l) =>
        l.status === 'active' &&
        (l.fromNodeId === currentId || l.toNodeId === currentId)
    );

    for (const link of activeLinks) {
      const neighborId =
        link.fromNodeId === currentId ? link.toNodeId : link.fromNodeId;
      if (!unvisited.has(neighborId)) continue;

      // Metric weight = 1000 / linkBandwidth + linkLatency
      const linkCost = Math.max(1, Math.round(100 / (link.trafficLoadPct + 1)));
      const newDist = (distances.get(currentId) || 0) + linkCost;

      if (newDist < (distances.get(neighborId) || Infinity)) {
        distances.set(neighborId, newDist);
        previousNode.set(neighborId, { nodeId: currentId, linkId: link.id });
      }
    }
  }

  const generatedRoutes: RouteEntry[] = [];

  // Generate routes for all reachable nodes
  nodes.forEach((targetNode) => {
    if (targetNode.id === sourceNodeId) return;

    // Trace back path
    let curr = targetNode.id;
    let firstHopId: string | null = null;
    let firstLinkId: string | null = null;

    while (previousNode.has(curr)) {
      const prev = previousNode.get(curr)!;
      if (prev.nodeId === sourceNodeId) {
        firstHopId = curr;
        firstLinkId = prev.linkId;
        break;
      }
      curr = prev.nodeId;
    }

    if (firstHopId && firstLinkId) {
      const hopNode = nodeMap.get(firstHopId);
      const targetInterfaces = targetNode.interfaces.filter((i) => i.ip);

      targetInterfaces.forEach((iface) => {
        const cidr = `${iface.ip}/${maskToCidr(iface.subnetMask)}`;
        const nextHopIp = hopNode?.interfaces[0]?.ip || 'DIRECT';
        generatedRoutes.push({
          id: `dijkstra-${sourceNodeId}-${targetNode.id}-${iface.id}`,
          destinationCIDR: cidr,
          nextHop: nextHopIp,
          interfaceId: firstLinkId!,
          metric: distances.get(targetNode.id) || 1,
          type: 'DYNAMIC_DIJKSTRA',
        });
      });
    }
  });

  return generatedRoutes;
}

export function lookupLongestPrefixRoute(
  destIp: string,
  routes: RouteEntry[]
): RouteEntry | null {
  let bestRoute: RouteEntry | null = null;
  let maxPrefixLength = -1;

  for (const route of routes) {
    if (route.destinationCIDR === '0.0.0.0/0') {
      if (maxPrefixLength < 0) {
        bestRoute = route;
        maxPrefixLength = 0;
      }
      continue;
    }

    if (isIpInSubnet(destIp, route.destinationCIDR)) {
      const prefixBits = parseInt(route.destinationCIDR.split('/')[1] || '0', 10);
      if (prefixBits > maxPrefixLength) {
        maxPrefixLength = prefixBits;
        bestRoute = route;
      }
    }
  }

  return bestRoute;
}
