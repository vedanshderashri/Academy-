import { Mission, NetworkNode, NetworkLink } from '../../types/network';

export const MISSION_LIST: Mission[] = [
  {
    id: 1,
    title: 'Mission 1: Basic LAN Setup',
    category: 'Fundamentals',
    difficulty: 'Beginner',
    description: 'Connect two PCs through a Switch and verify local communication using Ping.',
    objectives: [
      'Add Switch-1 to topology',
      'Connect PC-1 and PC-2 to Switch-1 via Cat5 Cables',
      'Assign IP 192.168.1.10 to PC-1 and 192.168.1.11 to PC-2',
      'Send a Ping packet from PC-1 to PC-2',
    ],
    goals: [
      {
        id: 'g1-1',
        description: 'Connect at least 2 PCs to 1 Switch',
        completed: false,
        check: (nodes, links) => {
          const sw = nodes.find((n) => n.type === 'switch');
          if (!sw) return false;
          const connectedLinks = links.filter(
            (l) => l.fromNodeId === sw.id || l.toNodeId === sw.id
          );
          return connectedLinks.length >= 2;
        },
      },
      {
        id: 'g1-2',
        description: 'Successfully deliver a packet between PCs',
        completed: false,
        check: (nodes, links, traces) => {
          return traces.some((t) => t.status === 'DELIVERED' && t.frame.ethertype === 'IP');
        },
      },
    ],
    startingBudget: 5000,
    unlockedDevices: ['pc', 'switch'],
    initialNodes: [
      {
        id: 'pc-1',
        name: 'PC-1',
        type: 'pc',
        x: 180,
        y: 220,
        status: 'online',
        interfaces: [
          {
            id: 'eth0-1',
            name: 'eth0',
            mac: '00:1A:2B:3C:4D:01',
            ip: '192.168.1.10',
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
        memoryUsagePct: 12,
        powerConsumptionWatt: 65,
        purchaseCost: 400,
        monthlyMaintenanceCost: 10,
      },
      {
        id: 'pc-2',
        name: 'PC-2',
        type: 'pc',
        x: 520,
        y: 220,
        status: 'online',
        interfaces: [
          {
            id: 'eth0-2',
            name: 'eth0',
            mac: '00:1A:2B:3C:4D:02',
            ip: '192.168.1.11',
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
        memoryUsagePct: 12,
        powerConsumptionWatt: 65,
        purchaseCost: 400,
        monthlyMaintenanceCost: 10,
      },
    ],
    initialLinks: [],
    hint: 'Drag a Switch onto the canvas, then select the Cable tool to connect PC-1 and PC-2 to the Switch.',
    rewardMoney: 1000,
    explanation:
      'Switches operate at Layer 2 (Data Link Layer). They build a MAC address table by observing source MAC addresses of incoming frames and forward unicast frames directly to destination ports.',
  },
  {
    id: 2,
    title: 'Mission 2: Inter-Subnet Routing',
    category: 'Routing',
    difficulty: 'Beginner',
    description: 'Connect two distinct subnets (192.168.1.0/24 and 192.168.2.0/24) through a Router.',
    objectives: [
      'Deploy a Router between Switch-1 (Subnet A) and Switch-2 (Subnet B)',
      'Configure Default Gateway on PCs to point to Router IP',
      'Verify routing across subnets',
    ],
    goals: [
      {
        id: 'g2-1',
        description: 'Deploy a Router connected to both subnets',
        completed: false,
        check: (nodes, links) => {
          const r = nodes.find((n) => n.type === 'router');
          if (!r) return false;
          const rLinks = links.filter((l) => l.fromNodeId === r.id || l.toNodeId === r.id);
          return rLinks.length >= 2;
        },
      },
    ],
    startingBudget: 8000,
    unlockedDevices: ['pc', 'switch', 'router'],
    initialNodes: [],
    initialLinks: [],
    hint: 'Routers operate at Layer 3 (Network Layer) and connect different network subnets by examining destination IP addresses.',
    rewardMoney: 1500,
    explanation:
      'When a host wants to send data to an IP address outside its local subnet, it encapsulates the packet and forwards it to its Default Gateway (the router interface).',
  },
  {
    id: 3,
    title: 'Mission 3: Subnetting & CIDR',
    category: 'Fundamentals',
    difficulty: 'Intermediate',
    description: 'Divide a 192.168.10.0/24 network into 2 subnets using a /25 mask.',
    objectives: [
      'Subnet A: 192.168.10.0/25 (Usable IPs 192.168.10.1 - 192.168.10.126)',
      'Subnet B: 192.168.10.128/25 (Usable IPs 192.168.10.129 - 192.168.10.254)',
      'Configure hosts with valid subnet masks',
    ],
    goals: [
      {
        id: 'g3-1',
        description: 'Configure hosts in 2 distinct /25 CIDR subnets',
        completed: false,
        check: (nodes) => {
          const pcs = nodes.filter((n) => n.type === 'pc');
          return pcs.some((p) => p.interfaces[0]?.subnetMask === '255.255.255.128');
        },
      },
    ],
    startingBudget: 6000,
    unlockedDevices: ['pc', 'switch', 'router'],
    initialNodes: [],
    initialLinks: [],
    hint: 'A /25 mask corresponds to 255.255.255.128, allowing 126 usable hosts per subnet.',
    rewardMoney: 2000,
    explanation:
      'Subnetting reduces broadcast domain sizes and conserves IP addresses by allowing networks to be split into custom sizes based on CIDR bits.',
  },
  {
    id: 4,
    title: 'Mission 4: DHCP Auto-Configuration',
    category: 'Services',
    difficulty: 'Intermediate',
    description: 'Deploy a DHCP Server so client PCs automatically acquire IP address, Subnet Mask, Gateway, and DNS.',
    objectives: [
      'Deploy a Server device and enable DHCP service',
      'Set IP Pool from 192.168.1.100 to 192.168.1.200',
      'Enable DHCP Client on PC-1 and verify lease acquisition',
    ],
    goals: [
      {
        id: 'g4-1',
        description: 'Enable DHCP Server with valid pool',
        completed: false,
        check: (nodes) => {
          return nodes.some((n) => n.type === 'server' && n.services?.dhcpServer?.enabled);
        },
      },
    ],
    startingBudget: 7000,
    unlockedDevices: ['pc', 'switch', 'router', 'server'],
    initialNodes: [],
    initialLinks: [],
    hint: 'DHCP uses a 4-step DORA process: Discover (Broadcast), Offer (Unicast/Broadcast), Request, and ACK.',
    rewardMoney: 1800,
    explanation:
      'DHCP eliminates manual static IP configuration errors across large client fleets by dynamically allocating leases from a centralized server.',
  },
  {
    id: 5,
    title: 'Mission 5: Domain Name System (DNS)',
    category: 'Services',
    difficulty: 'Intermediate',
    description: 'Configure a DNS Server with A records for company websites so clients can resolve domain names to IPs.',
    objectives: [
      'Deploy a DNS Server with IP 192.168.1.5',
      'Add A record: www.tycoon.com -> 192.168.1.50',
      'Perform a DNS lookup from client PC',
    ],
    goals: [
      {
        id: 'g5-1',
        description: 'DNS Server resolves www.tycoon.com',
        completed: false,
        check: (nodes) => {
          const srv = nodes.find((n) => n.type === 'server' && n.services?.dnsServer?.enabled);
          if (!srv || !srv.services.dnsServer?.records) return false;
          return srv.services.dnsServer.records.some((r) => r.domain === 'www.tycoon.com');
        },
      },
    ],
    startingBudget: 9000,
    unlockedDevices: ['pc', 'switch', 'router', 'server'],
    initialNodes: [],
    initialLinks: [],
    hint: 'DNS maps human-friendly domain names to numeric IP addresses using UDP port 53.',
    rewardMoney: 2200,
    explanation:
      'DNS operates in a hierarchical structure (Root -> TLD -> Authoritative). Resolvers query DNS servers to translate web names into routing target IPs.',
  },
  {
    id: 6,
    title: 'Mission 6: Web Server & HTTP Simulation',
    category: 'Services',
    difficulty: 'Intermediate',
    description: 'Deploy a Web Server, configure HTTP port 80, and observe the TCP 3-way handshake and HTTP GET response.',
    objectives: [
      'Deploy Web Server with static HTML root page',
      'Connect client PC and send HTTP Request',
      'Inspect TCP SYN, SYN-ACK, ACK handshake in Protocol Inspector',
    ],
    goals: [
      {
        id: 'g6-1',
        description: 'Web Server handles HTTP GET requests',
        completed: false,
        check: (nodes) => {
          return nodes.some((n) => n.type === 'server' && (n.services?.webServer?.requestCount || 0) > 0);
        },
      },
    ],
    startingBudget: 10000,
    unlockedDevices: ['pc', 'switch', 'router', 'server'],
    initialNodes: [],
    initialLinks: [],
    hint: 'HTTP runs over reliable TCP connection. Before HTTP data is exchanged, a 3-way handshake (SYN, SYN-ACK, ACK) establishes sequence synchronization.',
    rewardMoney: 2500,
    explanation:
      'TCP provides reliable, ordered data delivery with sequence numbers, acknowledgements, and retransmissions in case of packet loss.',
  },
  {
    id: 7,
    title: 'Mission 7: VLAN Segmentation & Security',
    category: 'Security',
    difficulty: 'Advanced',
    description: 'Configure VLAN 10 (Students) and VLAN 20 (Faculty) on a Switch to isolate broadcast domains.',
    objectives: [
      'Configure Switch ports 1-2 on VLAN 10 and ports 3-4 on VLAN 20',
      'Verify that broadcast traffic from VLAN 10 does NOT reach VLAN 20',
    ],
    goals: [
      {
        id: 'g7-1',
        description: 'Configure VLAN 10 and VLAN 20 on Switch',
        completed: false,
        check: (nodes) => {
          const sw = nodes.find((n) => n.type === 'switch');
          return !!sw && sw.interfaces.some((i) => i.vlanId === 10);
        },
      },
    ],
    startingBudget: 12000,
    unlockedDevices: ['pc', 'switch', 'router', 'server', 'firewall'],
    initialNodes: [],
    initialLinks: [],
    hint: 'VLANs logically divide a single physical switch into separate broadcast domains for security and performance.',
    rewardMoney: 3000,
    explanation:
      'IEEE 802.1Q inserts a 4-byte VLAN tag into Ethernet frames to preserve VLAN membership across Trunk links.',
  },
  {
    id: 8,
    title: 'Mission 8: Dynamic Routing (Dijkstra / OSPF)',
    category: 'Routing',
    difficulty: 'Advanced',
    description: 'Build a mesh topology with 3 Routers and enable dynamic shortest path pathfinding.',
    objectives: [
      'Connect Router-A, Router-B, and Router-C in a triangle topology',
      'Verify that packets automatically take the lowest latency path',
    ],
    goals: [
      {
        id: 'g8-1',
        description: 'Deploy 3 mesh-connected Routers',
        completed: false,
        check: (nodes) => {
          return nodes.filter((n) => n.type === 'router').length >= 3;
        },
      },
    ],
    startingBudget: 15000,
    unlockedDevices: ['pc', 'switch', 'router', 'server'],
    initialNodes: [],
    initialLinks: [],
    hint: 'Dynamic routing protocols automatically recalculate topology metrics when link costs or link failures occur.',
    rewardMoney: 3500,
    explanation:
      'Dijkstra algorithm calculates shortest paths from a source router to all destination nodes by minimizing path link cost weights.',
  },
  {
    id: 9,
    title: 'Mission 9: Network Troubleshooting',
    category: 'Troubleshooting',
    difficulty: 'Intermediate',
    description: 'A misconfigured corporate network is failing. Use diagnostic tools (Ping, ARP, Route inspection) to identify and fix the issue.',
    objectives: [
      'Diagnose why PC-1 cannot reach Server-1',
      'Fix incorrect Subnet Mask or Gateway IP',
    ],
    goals: [
      {
        id: 'g9-1',
        description: 'Restore PC to Server reachability',
        completed: false,
        check: (nodes, links, traces) => {
          return traces.some((t) => t.status === 'DELIVERED' && t.frame.payload?.protocol === 'TCP');
        },
      },
    ],
    startingBudget: 10000,
    unlockedDevices: ['pc', 'switch', 'router', 'server'],
    initialNodes: [],
    initialLinks: [],
    hint: 'Check if PC-1 has its Default Gateway pointing to the correct router interface IP address.',
    rewardMoney: 2800,
    explanation:
      'Network troubleshooting requires systematic layer-by-layer inspection: L1 physical cable -> L2 MAC/ARP -> L3 IP/Gateway -> L4 Port -> L7 Application.',
  },
  {
    id: 10,
    title: 'Mission 10: Congestion & QoS Optimization',
    category: 'Troubleshooting',
    difficulty: 'Advanced',
    description: 'A 100Mbps Cat5 link is overloaded causing packet drops. Upgrade the link to Fiber and observe queue stabilization.',
    objectives: [
      'Identify congested link with 100% traffic load',
      'Replace Cat5 link with Fiber 10Gbps link',
      'Reduce packet drop percentage below 1%',
    ],
    goals: [
      {
        id: 'g10-1',
        description: 'Upgrade link to Fiber and clear congestion',
        completed: false,
        check: (nodes, links) => {
          return links.some((l) => l.type === 'fiber');
        },
      },
    ],
    startingBudget: 14000,
    unlockedDevices: ['pc', 'switch', 'router', 'server', 'access_point'],
    initialNodes: [],
    initialLinks: [],
    hint: 'When incoming packet rate exceeds link bandwidth capacity, interface buffers fill up and DropTail queuing drops overflow packets.',
    rewardMoney: 3200,
    explanation:
      'Quality of Service (QoS) and link capacity expansion prevent packet loss and latency jitter for high-priority video/voice streams.',
  },
  {
    id: 11,
    title: 'Mission 11: Enterprise Load Balancer',
    category: 'Enterprise',
    difficulty: 'Advanced',
    description: 'Deploy a Load Balancer to distribute incoming HTTP traffic between Server-A and Server-B.',
    objectives: [
      'Deploy Load Balancer node',
      'Configure Round-Robin algorithm for Web Server IPs',
      'Verify traffic distribution across both servers',
    ],
    goals: [
      {
        id: 'g11-1',
        description: 'Deploy Load Balancer node',
        completed: false,
        check: (nodes) => {
          return nodes.some((n) => n.type === 'load_balancer');
        },
      },
    ],
    startingBudget: 18000,
    unlockedDevices: ['pc', 'switch', 'router', 'server', 'load_balancer'],
    initialNodes: [],
    initialLinks: [],
    hint: 'Load balancers improve application scalability and availability by spreading client requests across redundant server farms.',
    rewardMoney: 4000,
    explanation:
      'Load balancing algorithms like Round Robin, Least Connections, and Weighted Distribution prevent individual server overload.',
  },
  {
    id: 12,
    title: 'Mission 12: Firewall Defense & Hardening',
    category: 'Security',
    difficulty: 'Advanced',
    description: 'A cyber attack is targeting SSH port 22. Deploy a Firewall and configure DENY rules for unauthorized ports.',
    objectives: [
      'Deploy Firewall node',
      'Add Firewall Rule: DENY TCP Port 22 from 0.0.0.0/0',
      'Add Firewall Rule: ALLOW TCP Port 80 for Web Traffic',
    ],
    goals: [
      {
        id: 'g12-1',
        description: 'Configure Firewall DENY rule for port 22',
        completed: false,
        check: (nodes) => {
          return nodes.some((n) =>
            n.firewallRules.some((r) => r.action === 'DENY' && r.dstPort === 22)
          );
        },
      },
    ],
    startingBudget: 16000,
    unlockedDevices: ['pc', 'switch', 'router', 'server', 'firewall'],
    initialNodes: [],
    initialLinks: [],
    hint: 'Firewalls inspect packet headers against an Access Control List (ACL) and drop non-compliant traffic.',
    rewardMoney: 4200,
    explanation:
      'Stateful firewalls maintain connection tracking tables to enforce security policies and block unauthorized port scans or malicious intrusions.',
  },
  {
    id: 13,
    title: 'Mission 13: University Campus Infrastructure',
    category: 'Enterprise',
    difficulty: 'Expert',
    description: 'Design a complete university campus network connecting Engineering, Administration, Library, and Server Farm with high uptime.',
    objectives: [
      'Build 4 subnets with dedicated Switches and Routers',
      'Deploy DHCP, DNS, and Web Servers',
      'Achieve 99.5% network uptime SLA',
    ],
    goals: [
      {
        id: 'g13-1',
        description: 'Deploy at least 8 network nodes and 3 servers',
        completed: false,
        check: (nodes) => {
          return nodes.length >= 8 && nodes.filter((n) => n.type === 'server').length >= 3;
        },
      },
    ],
    startingBudget: 30000,
    unlockedDevices: ['pc', 'laptop', 'switch', 'router', 'server', 'firewall', 'access_point', 'load_balancer', 'iot_sensor'],
    initialNodes: [],
    initialLinks: [],
    hint: 'Hierarchical network design splits campus networks into Core, Distribution, and Access layers.',
    rewardMoney: 6000,
    explanation:
      'Campus networks utilize redundant backbone routers, multi-VLAN distribution switches, and centralized AAA/DHCP authentication servers.',
  },
  {
    id: 14,
    title: 'Mission 14: Hospital High-Availability Network',
    category: 'Enterprise',
    difficulty: 'Expert',
    description: 'Design a critical healthcare network with zero packet loss tolerances and failover links for patient telemetry monitoring.',
    objectives: [
      'Deploy dual redundant Fiber backbone links between Core Routers',
      'Configure IoT sensors to stream medical telemetry',
    ],
    goals: [
      {
        id: 'g14-1',
        description: 'Deploy IoT Sensors and redundant Fiber links',
        completed: false,
        check: (nodes, links) => {
          const hasIoT = nodes.some((n) => n.type === 'iot_sensor');
          const fiberLinks = links.filter((l) => l.type === 'fiber');
          return hasIoT && fiberLinks.length >= 2;
        },
      },
    ],
    startingBudget: 35000,
    unlockedDevices: ['pc', 'laptop', 'switch', 'router', 'server', 'firewall', 'access_point', 'load_balancer', 'iot_sensor'],
    initialNodes: [],
    initialLinks: [],
    hint: 'High availability requires zero single points of failure through dual power supplies, redundant links, and automatic link aggregation.',
    rewardMoney: 7000,
    explanation:
      'Mission-critical healthcare networks enforce strict Quality of Service (QoS) to prioritize real-time ECG/telemetry packets over routine internet traffic.',
  },
  {
    id: 15,
    title: 'Mission 15: ISP Autonomous System Architecture',
    category: 'Routing',
    difficulty: 'Expert',
    description: 'Build an Internet Service Provider core transit network routing traffic across multiple Autonomous Systems.',
    objectives: [
      'Deploy Core Transit Routers with 10Gbps Fiber interconnections',
      'Establish BGP/OSPF dynamic routing paths',
    ],
    goals: [
      {
        id: 'g15-1',
        description: 'Deploy 4 Core Routers with Fiber links',
        completed: false,
        check: (nodes, links) => {
          const routers = nodes.filter((n) => n.type === 'router');
          const fiberLinks = links.filter((l) => l.type === 'fiber');
          return routers.length >= 4 && fiberLinks.length >= 4;
        },
      },
    ],
    startingBudget: 50000,
    unlockedDevices: ['pc', 'laptop', 'switch', 'router', 'server', 'firewall', 'load_balancer'],
    initialNodes: [],
    initialLinks: [],
    hint: 'BGP (Border Gateway Protocol) manages routing decisions between independent Autonomous Systems (AS) across the global Internet.',
    rewardMoney: 8500,
    explanation:
      'ISPs rely on high-capacity fiber optics, BGP path vector selection, and MPLS traffic engineering to route terabits of global traffic efficiently.',
  },
  {
    id: 16,
    title: 'Mission 16: Cloud Virtual Private Cloud (VPC)',
    category: 'Enterprise',
    difficulty: 'Expert',
    description: 'Construct a simulated Cloud Datacenter VPC with Public Subnets, Private Subnets, NAT Gateways, and Load Balancers.',
    objectives: [
      'Create Public Subnet with Load Balancer',
      'Create Private Subnet with Web & Database Servers behind NAT Router',
    ],
    goals: [
      {
        id: 'g16-1',
        description: 'Deploy Load Balancer and NAT Router for Private Subnet',
        completed: false,
        check: (nodes) => {
          const lb = nodes.some((n) => n.type === 'load_balancer');
          const r = nodes.some((n) => n.type === 'router');
          return lb && r;
        },
      },
    ],
    startingBudget: 45000,
    unlockedDevices: ['pc', 'switch', 'router', 'server', 'firewall', 'load_balancer'],
    initialNodes: [],
    initialLinks: [],
    hint: 'Public subnets face the external Internet via Internet Gateways, while Private subnets route outbound requests through NAT Gateways.',
    rewardMoney: 8000,
    explanation:
      'Cloud VPC architectures isolate backend database workloads in private subnets while exposing frontend web services via load balanced ingress.',
  },
  {
    id: 17,
    title: 'Mission 17: Red Team vs Blue Team Cyber Defense',
    category: 'Security',
    difficulty: 'Expert',
    description: 'An AI-driven Red Team attacker is launching port scans and DDoS floods. As Blue Team lead, deploy IDS monitoring and Firewall ACLs to protect critical servers.',
    objectives: [
      'Detect Red Team attack via IDS alerts',
      'Deploy Firewall rules to block attacker source IPs',
      'Maintain 95%+ server availability during attack',
    ],
    goals: [
      {
        id: 'g17-1',
        description: 'Deploy Firewall and block attacker traffic',
        completed: false,
        check: (nodes) => {
          return nodes.some((n) => n.firewallRules.length > 0);
        },
      },
    ],
    startingBudget: 40000,
    unlockedDevices: ['pc', 'switch', 'router', 'server', 'firewall', 'load_balancer'],
    initialNodes: [],
    initialLinks: [],
    hint: 'Use the Security Center tab to inspect real-time attack telemetry and deploy automated firewall block rules.',
    rewardMoney: 9000,
    explanation:
      'Cyber defense combines active intrusion detection (IDS/IPS), stateful firewalls, rate-limiting, and threat intelligence to preserve operational resilience.',
  },
  {
    id: 18,
    title: 'Mission 18: Cost-Constrained Network Optimization',
    category: 'Troubleshooting',
    difficulty: 'Expert',
    description: 'Design a high-performance network serving 100+ simulated users under a strict budget limit of $3,000.',
    objectives: [
      'Keep total network expenditure under $3,000',
      'Deliver 100% throughput efficiency without packet drops',
    ],
    goals: [
      {
        id: 'g18-1',
        description: 'Maintain network budget under $3,000 while serving traffic',
        completed: false,
        check: (nodes) => {
          const totalCost = nodes.reduce((sum, n) => sum + n.purchaseCost, 0);
          return totalCost <= 3000 && nodes.length >= 3;
        },
      },
    ],
    startingBudget: 3000,
    unlockedDevices: ['pc', 'laptop', 'switch', 'router', 'server'],
    initialNodes: [],
    initialLinks: [],
    hint: 'Balance device tier selection (e.g. Cat5 vs Fiber, standard vs enterprise routers) to optimize cost-to-performance ratio.',
    rewardMoney: 10000,
    explanation:
      'Real-world network engineering requires balancing technical SLA performance against capital expenditure (CapEx) and operational expenditure (OpEx).',
  },
];
