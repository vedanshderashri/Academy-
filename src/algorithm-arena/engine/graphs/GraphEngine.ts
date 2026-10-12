import { GraphVertex, GraphEdge } from '../../core/types';

export interface GraphStep {
  stepIndex: number;
  vertices: GraphVertex[];
  edges: GraphEdge[];
  queueState?: string[];
  stackState?: string[];
  distanceTable?: { [vId: string]: number };
  description: string;
  currentVertexId?: string;
  activeEdgeId?: string;
}

export class GraphEngine {
  private vertices: GraphVertex[] = [
    { id: 'A', label: 'A', x: 150, y: 100 },
    { id: 'B', label: 'B', x: 350, y: 80 },
    { id: 'C', label: 'C', x: 550, y: 150 },
    { id: 'D', label: 'D', x: 250, y: 280 },
    { id: 'E', label: 'E', x: 450, y: 300 },
  ];

  private edges: GraphEdge[] = [
    { id: 'e1', from: 'A', to: 'B', weight: 4 },
    { id: 'e2', from: 'A', to: 'D', weight: 2 },
    { id: 'e3', from: 'B', to: 'C', weight: 6 },
    { id: 'e4', from: 'B', to: 'E', weight: 3 },
    { id: 'e5', from: 'D', to: 'E', weight: 1 },
    { id: 'e6', from: 'E', to: 'C', weight: 2 },
  ];

  private history: GraphStep[] = [];

  constructor() {
    this.recordStep('Initialized Weighted Graph Editor dataset');
  }

  private recordStep(description: string, currentVId?: string, activeEId?: string, queueState?: string[], stackState?: string[], distanceTable?: { [vId: string]: number }) {
    this.history.push({
      stepIndex: this.history.length,
      vertices: JSON.parse(JSON.stringify(this.vertices)),
      edges: JSON.parse(JSON.stringify(this.edges)),
      queueState,
      stackState,
      distanceTable,
      description,
      currentVertexId: currentVId,
      activeEdgeId: activeEId,
    });
  }

  public runBFS(startId: string = 'A'): GraphStep[] {
    const visited = new Set<string>();
    const queue: string[] = [startId];
    visited.add(startId);

    this.recordStep(`Starting BFS Traversal from vertex [${startId}]`, startId, undefined, [...queue]);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      this.recordStep(`Dequeued vertex [${curr}] - exploring neighbors`, curr, undefined, [...queue]);

      const nEdges = this.edges.filter((e) => e.from === curr || e.to === curr);
      for (const edge of nEdges) {
        const neighbor = edge.from === curr ? edge.to : edge.from;
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
          this.recordStep(`Visited neighbor [${neighbor}] via edge weight ${edge.weight}`, neighbor, edge.id, [...queue]);
        }
      }
    }

    this.recordStep('Breadth-First Search (BFS) Traversal Complete!', undefined, undefined, []);
    return this.history;
  }

  public runDFS(startId: string = 'A'): GraphStep[] {
    const visited = new Set<string>();
    const stack: string[] = [];

    const dfsHelper = (curr: string) => {
      visited.add(curr);
      stack.push(curr);
      this.recordStep(`DFS Recursive call: visiting vertex [${curr}]`, curr, undefined, undefined, [...stack]);

      const nEdges = this.edges.filter((e) => e.from === curr || e.to === curr);
      for (const edge of nEdges) {
        const neighbor = edge.from === curr ? edge.to : edge.from;
        if (!visited.has(neighbor)) {
          dfsHelper(neighbor);
        }
      }
      stack.pop();
    };

    this.recordStep(`Starting DFS Traversal from vertex [${startId}]`, startId);
    dfsHelper(startId);
    this.recordStep('Depth-First Search (DFS) Traversal Complete!', undefined, undefined, undefined, []);
    return this.history;
  }

  public runDijkstra(startId: string = 'A'): GraphStep[] {
    const dist: { [vId: string]: number } = {};
    this.vertices.forEach((v) => (dist[v.id] = Infinity));
    dist[startId] = 0;

    const unvisited = new Set(this.vertices.map((v) => v.id));
    this.recordStep(`Dijkstra Initialized: Distance to [${startId}] = 0, others = ∞`, startId, undefined, undefined, undefined, { ...dist });

    while (unvisited.size > 0) {
      let minV: string | null = null;
      let minD = Infinity;

      for (const vId of unvisited) {
        if (dist[vId] < minD) {
          minD = dist[vId];
          minV = vId;
        }
      }

      if (!minV || minD === Infinity) break;
      unvisited.delete(minV);

      this.recordStep(`Selected unvisited vertex [${minV}] with min distance ${minD}`, minV, undefined, undefined, undefined, { ...dist });

      const outgoing = this.edges.filter((e) => e.from === minV || e.to === minV);
      for (const edge of outgoing) {
        const neighbor = edge.from === minV ? edge.to : edge.from;
        if (unvisited.has(neighbor)) {
          const newDist = dist[minV] + edge.weight;
          if (newDist < dist[neighbor]) {
            dist[neighbor] = newDist;
            this.recordStep(`Relaxed edge (${minV} ➔ ${neighbor}): updated distance to ${newDist}`, neighbor, edge.id, undefined, undefined, { ...dist });
          }
        }
      }
    }

    this.recordStep('Dijkstra Shortest Path Algorithm Completed!', undefined, undefined, undefined, undefined, { ...dist });
    return this.history;
  }

  public getHistory(): GraphStep[] {
    return this.history;
  }
}
