export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

export const RESEARCH_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'At which OSI layer does an Ethernet Switch primarily operate?',
    options: ['Layer 1 (Physical)', 'Layer 2 (Data Link)', 'Layer 3 (Network)', 'Layer 4 (Transport)'],
    correctAnswer: 1,
    explanation: 'Switches operate at Layer 2 by maintaining a MAC address table to forward Ethernet frames.',
    topic: 'OSI Model',
  },
  {
    id: 2,
    question: 'How many usable host IP addresses are available in a /26 IPv4 subnet?',
    options: ['30', '62', '126', '254'],
    correctAnswer: 1,
    explanation: 'A /26 subnet has 32 - 26 = 6 host bits ($2^6 = 64$). Subtracting network and broadcast addresses leaves 62 usable host IPs.',
    topic: 'Subnetting',
  },
  {
    id: 3,
    question: 'What is the primary purpose of the ARP protocol?',
    options: [
      'Assign IP addresses dynamically',
      'Resolve IP addresses to MAC addresses',
      'Translate domain names to IP addresses',
      'Filter unauthorized network ports',
    ],
    correctAnswer: 1,
    explanation: 'ARP (Address Resolution Protocol) resolves a known IPv4 address to its corresponding destination MAC address on a local segment.',
    topic: 'ARP',
  },
  {
    id: 4,
    question: 'Which sequence correctly represents the TCP 3-Way Handshake connection establishment?',
    options: ['SYN -> ACK -> DATA', 'SYN -> SYN-ACK -> ACK', 'FIN -> ACK -> FIN-ACK', 'REQUEST -> OFFER -> ACK'],
    correctAnswer: 1,
    explanation: 'TCP connection setup uses SYN from sender, SYN-ACK response from receiver, and final ACK from sender.',
    topic: 'TCP/UDP',
  },
  {
    id: 5,
    question: 'Which algorithm is commonly used by link-state routing protocols like OSPF to compute shortest paths?',
    options: ['Bellman-Ford', 'Dijkstra', 'Floyd-Warshall', 'Kruskal'],
    correctAnswer: 1,
    explanation: 'Dijkstra shortest path algorithm computes the path of least cost from a router to all destinations.',
    topic: 'Routing',
  },
  {
    id: 6,
    question: 'How does a Firewall determine whether to ALLOW or DENY an incoming packet?',
    options: [
      'By inspecting CPU utilization',
      'By evaluating Access Control Rules against Src/Dst IP, Port, and Protocol',
      'By retransmitting dropped frames',
      'By querying a DNS root server',
    ],
    correctAnswer: 1,
    explanation: 'Firewalls match incoming headers against ordered Access Control Lists (ACLs) containing IP, port, and protocol conditions.',
    topic: 'Firewall',
  },
];

export const TOC_RESEARCH_QUESTIONS: QuizQuestion[] = [
  {
    id: 101,
    question: 'Which machine model is capable of recognizing Type 3 Regular Languages in the Chomsky Hierarchy?',
    options: ['Deterministic Finite Automaton (DFA)', 'Pushdown Automaton (PDA)', 'Linear Bounded Automaton (LBA)', 'Turing Machine (TM)'],
    correctAnswer: 0,
    explanation: 'Regular languages are recognized by Finite Automata (DFA and NFA).',
    topic: 'Automata Theory',
  },
  {
    id: 102,
    question: 'What is the key structural difference between a Deterministic Finite Automaton (DFA) and a Non-deterministic Finite Automaton (NFA)?',
    options: [
      'DFAs have memory stacks while NFAs do not',
      'DFAs have exactly one transition per state for each alphabet symbol, while NFAs can have multiple transitions or epsilon (ε) moves',
      'NFAs are strictly more powerful computationally than DFAs',
      'DFAs can recognize context-free grammars while NFAs cannot',
    ],
    correctAnswer: 1,
    explanation: 'DFAs enforce a single transition per symbol from each state. NFAs permit multiple transitions, no transitions, or ε transitions.',
    topic: 'Automata Theory',
  },
  {
    id: 103,
    question: 'According to the Pumping Lemma for Regular Languages, if L is regular, any sufficiently long string s in L can be split into uvw such that:',
    options: [
      'u^i v w^i is in L for all i >= 0',
      'u v^i w is in L for all i >= 0',
      'u^i v^i w^i is in L for all i >= 0',
      'v must equal the empty string ε',
    ],
    correctAnswer: 1,
    explanation: 'The pumping lemma states that the middle segment v can be repeated ("pumped") any number of times (u v^i w ∈ L for all i ≥ 0).',
    topic: 'Pumping Lemma',
  },
  {
    id: 104,
    question: 'Which computational model uses an infinite two-way tape and a read/write head?',
    options: ['Finite State Machine', 'Pushdown Automaton', 'Turing Machine', 'Counter Automaton'],
    correctAnswer: 2,
    explanation: 'A Turing Machine consists of an infinite tape memory that can be read from and written to by a moving head.',
    topic: 'Turing Machines',
  },
  {
    id: 105,
    question: 'Which formal language class corresponds to Context-Free Grammars (Type 2)?',
    options: ['Languages recognized by Pushdown Automata (PDA)', 'Languages recognized by DFAs', 'Languages recognized by Linear Bounded Automata', 'Decidable Languages'],
    correctAnswer: 0,
    explanation: 'Context-Free Languages (CFLs) are recognized by Pushdown Automata utilizing a single LIFO stack memory.',
    topic: 'Formal Languages',
  },
];

export const DSA_RESEARCH_QUESTIONS: QuizQuestion[] = [
  {
    id: 201,
    question: 'What is the worst-case time complexity of standard Quick Sort when a bad pivot (e.g. smallest element) is consistently chosen?',
    options: ['O(N log N)', 'O(N)', 'O(N²)', 'O(2ⁿ)'],
    correctAnswer: 2,
    explanation: 'When Quick Sort chooses an extreme element as pivot on an already sorted array, recursion depth reaches N, leading to O(N²) time complexity.',
    topic: 'Sorting & Complexity',
  },
  {
    id: 202,
    question: 'In Floyd’s Cycle-Finding Algorithm for Linked Lists, by how many steps do the Slow and Fast pointers advance in each iteration?',
    options: ['Slow: 1 step, Fast: 2 steps', 'Slow: 1 step, Fast: 3 steps', 'Slow: 2 steps, Fast: 2 steps', 'Slow: 0 steps, Fast: 1 step'],
    correctAnswer: 0,
    explanation: 'Floyd’s tortoise and hare algorithm moves the Slow pointer by 1 node and Fast pointer by 2 nodes per loop iteration.',
    topic: 'Linked Lists',
  },
  {
    id: 203,
    question: 'What is the maximum allowed Balance Factor for any node in a valid AVL Tree?',
    options: ['0', '{-1, 0, +1}', '{-2, 0, +2}', 'Unlimited'],
    correctAnswer: 1,
    explanation: 'AVL Trees enforce strict balance factor invariants: height(Left) - height(Right) must be in {-1, 0, +1}. Rotations occur if |BF| > 1.',
    topic: 'Trees & AVL',
  },
  {
    id: 204,
    question: 'Which graph algorithm computes the Single-Source Shortest Path on weighted graphs with non-negative edge weights in O((V + E) log V)?',
    options: ['BFS', 'DFS', 'Dijkstra Algorithm', 'Floyd-Warshall'],
    correctAnswer: 2,
    explanation: 'Dijkstra algorithm using a Priority Queue / Min Heap computes shortest path distances from a single source in O((V + E) log V) time.',
    topic: 'Graph Algorithms',
  },
  {
    id: 205,
    question: 'What are the two key properties required for a problem to be solved using Dynamic Programming?',
    options: [
      'Greedy Choice Property & Optimal Substructure',
      'Overlapping Subproblems & Optimal Substructure',
      'Divide and Conquer & Linear Search',
      'LIFO Stacks & FIFO Queues',
    ],
    correctAnswer: 1,
    explanation: 'Dynamic Programming applies to problems exhibiting Overlapping Subproblems (subproblems recur) and Optimal Substructure (optimal solution built from sub-solutions).',
    topic: 'Dynamic Programming',
  },
];

export interface AssessmentResult {
  timestamp: number;
  type: 'PRE_TEST' | 'POST_TEST';
  score: number;
  total: number;
  percentage: number;
  answers: Record<number, number>;
  topicBreakdown: Record<string, { correct: number; total: number }>;
}

export function evaluateQuiz(
  type: 'PRE_TEST' | 'POST_TEST',
  answers: Record<number, number>
): AssessmentResult {
  let score = 0;
  const topicBreakdown: Record<string, { correct: number; total: number }> = {};

  RESEARCH_QUESTIONS.forEach((q) => {
    if (!topicBreakdown[q.topic]) {
      topicBreakdown[q.topic] = { correct: 0, total: 0 };
    }
    topicBreakdown[q.topic].total += 1;

    if (answers[q.id] === q.correctAnswer) {
      score += 1;
      topicBreakdown[q.topic].correct += 1;
    }
  });

  const percentage = Math.round((score / RESEARCH_QUESTIONS.length) * 100);

  return {
    timestamp: Date.now(),
    type,
    score,
    total: RESEARCH_QUESTIONS.length,
    percentage,
    answers,
    topicBreakdown,
  };
}
