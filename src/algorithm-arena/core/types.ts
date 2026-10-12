export type DSAEventType =
  | 'ARRAY_ACCESS'
  | 'ARRAY_SWAP'
  | 'ARRAY_OVERWRITE'
  | 'COMPARISON'
  | 'POINTER_MOVE'
  | 'SUBARRAY_HIGHLIGHT'
  | 'PIVOT_SELECT'
  | 'MERGE_STEP'
  | 'LINKED_LIST_INSERT'
  | 'LINKED_LIST_DELETE'
  | 'LINKED_LIST_POINTER_MOVE'
  | 'STACK_PUSH'
  | 'STACK_POP'
  | 'QUEUE_ENQUEUE'
  | 'QUEUE_DEQUEUE'
  | 'TREE_INSERT'
  | 'TREE_DELETE'
  | 'TREE_ROTATION'
  | 'TREE_VISIT'
  | 'GRAPH_VISIT'
  | 'EDGE_RELAX'
  | 'MST_EDGE_ADD'
  | 'DP_CELL_UPDATE'
  | 'BACKTRACK_TRY'
  | 'BACKTRACK_REVERT'
  | 'STRING_MATCH'
  | 'BIT_SHIFT'
  | 'BIT_TOGGLE';

export interface DSAPointers {
  [name: string]: number | string; // e.g. low, mid, high, i, j, pivot, slow, fast, head, curr
}

export interface DSAMetrics {
  comparisons: number;
  swaps: number;
  accesses: number;
  arrayMutations: number;
  elapsedMs: number;
}

export interface DSASimulationStep {
  stepIndex: number;
  type: DSAEventType;
  arrayState: number[];
  auxArrayState?: number[];
  activeIndices: number[]; // Indices currently being operated on
  comparingIndices?: number[];
  swappingIndices?: number[];
  sortedIndices?: number[];
  pointers: DSAPointers;
  highlightRange?: [number, number]; // Subarray range e.g. [low, high]
  description: string;
  metrics: DSAMetrics;
}

// Linked List Node Data Structure
export interface LLNode {
  id: string;
  value: number;
  nextId: string | null;
  prevId?: string | null;
  highlight?: 'active' | 'slow' | 'fast' | 'head' | 'tail' | 'target' | 'null';
}

// Tree Node Data Structure (BST, AVL, Heap, Trie)
export interface TreeNode {
  id: string;
  value: number | string;
  leftId: string | null;
  rightId: string | null;
  height?: number;
  balanceFactor?: number;
  color?: 'red' | 'black'; // Red-Black Tree support
  highlight?: 'active' | 'compared' | 'rotated' | 'visited';
}

// Graph Vertex & Edge Structures
export interface GraphVertex {
  id: string;
  label: string;
  x: number;
  y: number;
  status?: 'unvisited' | 'visiting' | 'visited' | 'current' | 'in_queue' | 'in_stack';
  distance?: number;
  parent?: string | null;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
  status?: 'default' | 'considering' | 'relaxed' | 'in_mst' | 'in_path' | 'cycle';
  directed?: boolean;
}

// DP Table Cell State
export interface DPCell {
  row: number;
  col: number;
  val: number;
  status?: 'empty' | 'computing' | 'computed' | 'optimal_path';
}
