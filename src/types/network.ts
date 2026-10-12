export type NodeType = 
  | 'pc' 
  | 'laptop' 
  | 'server' 
  | 'switch' 
  | 'router' 
  | 'firewall' 
  | 'access_point' 
  | 'load_balancer' 
  | 'iot_sensor';

export type LinkType = 'cat5' | 'cat6' | 'fiber' | 'wireless';

export interface LinkSpec {
  bandwidthMbps: number;
  latencyMs: number;
  costPerMeter: number;
  maxDistanceMeter: number;
  color: string;
}

export const LINK_SPECS: Record<LinkType, LinkSpec> = {
  cat5: { bandwidthMbps: 100, latencyMs: 5, costPerMeter: 2, maxDistanceMeter: 100, color: '#3b82f6' },
  cat6: { bandwidthMbps: 1000, latencyMs: 2, costPerMeter: 5, maxDistanceMeter: 100, color: '#10b981' },
  fiber: { bandwidthMbps: 10000, latencyMs: 0.5, costPerMeter: 25, maxDistanceMeter: 10000, color: '#ec4899' },
  wireless: { bandwidthMbps: 300, latencyMs: 12, costPerMeter: 0, maxDistanceMeter: 50, color: '#f59e0b' }
};

export interface ARPEntry {
  ip: string;
  mac: string;
  ttlSeconds: number;
}

export interface MACTableEntry {
  mac: string;
  portId: string;
  vlanId: number;
  ageSeconds: number;
}

export interface RouteEntry {
  id: string;
  destinationCIDR: string;
  nextHop: string; // IP or 'DIRECT'
  interfaceId: string;
  metric: number;
  type: 'STATIC' | 'DYNAMIC_DIJKSTRA' | 'DIRECT';
}

export interface DNSRecord {
  domain: string;
  ip: string;
  type: 'A' | 'AAAA' | 'CNAME';
  ttl: number;
}

export interface DHCPPool {
  enabled: boolean;
  networkCIDR: string;
  startIp: string;
  endIp: string;
  gateway: string;
  dnsServer: string;
  leases: Record<string, { mac: string; ip: string; expiresAt: number }>;
}

export interface FirewallRule {
  id: string;
  priority: number;
  action: 'ALLOW' | 'DENY';
  protocol: 'ANY' | 'TCP' | 'UDP' | 'ICMP';
  srcCIDR: string;
  dstCIDR: string;
  dstPort?: number;
  description: string;
}

export interface ServerService {
  webServer?: { enabled: boolean; port: number; rootPage: string; requestCount: number };
  dnsServer?: { enabled: boolean; records: DNSRecord[] };
  dhcpServer?: DHCPPool;
  fileServer?: { enabled: boolean; storageGb: number };
}

export interface ApplicationL7 {
  type: 'DHCP_DISCOVER' | 'DHCP_OFFER' | 'DHCP_REQUEST' | 'DHCP_ACK'
        | 'DNS_QUERY' | 'DNS_RESPONSE'
        | 'HTTP_REQUEST' | 'HTTP_RESPONSE'
        | 'ICMP_PING_REQ' | 'ICMP_PING_REPLY'
        | 'ATTACK_PORT_SCAN' | 'ATTACK_DDOS' | 'ATTACK_ARP_SPOOF';
  data: any;
}

export interface SegmentL4 {
  srcPort: number;
  dstPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  seqNumber?: number;
  ackNumber?: number;
  flags?: { syn: boolean; ack: boolean; fin: boolean; rst: boolean };
  windowSize?: number;
  payload: ApplicationL7;
}

export interface PacketL3 {
  srcIp: string;
  dstIp: string;
  ttl: number;
  protocol: 'ICMP' | 'TCP' | 'UDP';
  payload: SegmentL4;
}

export interface FrameL2 {
  srcMac: string;
  dstMac: string;
  vlanId?: number;
  ethertype: 'ARP' | 'IP';
  arpData?: {
    op: 'REQUEST' | 'REPLY';
    senderMac: string;
    senderIp: string;
    targetMac: string;
    targetIp: string;
  };
  payload?: PacketL3;
}

export interface PacketTrace {
  id: string;
  timestamp: number;
  sourceNodeId: string;
  targetNodeId: string;
  currentNodeId: string;
  progress: number; // 0 to 1 along cable
  linkId?: string;
  frame: FrameL2;
  status: 'IN_FLIGHT' | 'DELIVERED' | 'DROPPED' | 'BLOCKED';
  dropReason?: string;
}

export interface NodeInterface {
  id: string;
  name: string;
  mac: string;
  ip: string;
  subnetMask: string;
  connectedLinkId?: string;
  vlanId: number;
  mode: 'access' | 'trunk';
  allowedVlans?: number[];
  queue: PacketTrace[];
  maxQueueSize: number;
  bytesSent: number;
  bytesReceived: number;
}

export interface NetworkNode {
  id: string;
  name: string;
  type: NodeType;
  x: number;
  y: number;
  status: 'online' | 'offline' | 'congested' | 'attacked';
  interfaces: NodeInterface[];
  macTable: MACTableEntry[];
  routingTable: RouteEntry[];
  arpCache: ARPEntry[];
  firewallRules: FirewallRule[];
  services: ServerService;
  dhcpClientEnabled?: boolean;
  natEnabled?: boolean;
  natTable?: Record<string, { privateIp: string; privatePort: number; publicPort: number }>;
  loadBalancer?: { algorithm: 'round_robin' | 'least_conn'; targetServerIps: string[]; currentIndex: number };
  cpuUsagePct: number;
  memoryUsagePct: number;
  powerConsumptionWatt: number;
  purchaseCost: number;
  monthlyMaintenanceCost: number;
}

export interface NetworkLink {
  id: string;
  fromNodeId: string;
  fromInterfaceId: string;
  toNodeId: string;
  toInterfaceId: string;
  type: LinkType;
  status: 'active' | 'broken' | 'congested';
  lengthMeters: number;
  trafficLoadPct: number;
}

export interface MissionGoal {
  id: string;
  description: string;
  completed: boolean;
  check: (nodes: NetworkNode[], links: NetworkLink[], traces: PacketTrace[]) => boolean;
}

export interface Mission {
  id: number;
  title: string;
  category: 'Fundamentals' | 'Routing' | 'Services' | 'Troubleshooting' | 'Security' | 'Enterprise';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  description: string;
  objectives: string[];
  goals: MissionGoal[];
  startingBudget: number;
  unlockedDevices: NodeType[];
  initialNodes: NetworkNode[];
  initialLinks: NetworkLink[];
  hint: string;
  rewardMoney: number;
  explanation: string;
}

export interface NOCMetrics {
  activePacketsCount: number;
  totalPacketsProcessed: number;
  throughputMbps: number;
  averageLatencyMs: number;
  packetLossPercentage: number;
  droppedPacketsCount: number;
  securityAlertsCount: number;
  networkUptimePercentage: number;
  totalBudget: number;
  monthlyCost: number;
}

export interface SecurityAlert {
  id: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  sourceNodeId?: string;
  targetNodeId?: string;
  mitigated: boolean;
}

export interface CongestionPoint {
  time: number;
  cwnd: number;
  ssthresh: number;
  rtt: number;
}
