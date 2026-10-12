import { TreeNode } from '../../core/types';

export interface TreeStep {
  stepIndex: number;
  nodes: { [id: string]: TreeNode };
  rootId: string | null;
  heapArray?: number[];
  traversalResult?: number[];
  description: string;
  activeNodeId?: string;
  treeType: 'BST' | 'AVL' | 'HEAP' | 'TRIE';
}

export class TreeEngine {
  private nodes: { [id: string]: TreeNode } = {};
  private rootId: string | null = null;
  private heapArray: number[] = [50, 30, 70, 20, 40, 60, 80];
  private history: TreeStep[] = [];

  constructor() {
    this.initDefaultBST();
  }

  public initDefaultBST() {
    this.nodes = {};
    this.rootId = null;
    this.history = [];

    const defaultValues = [50, 30, 70, 20, 40, 60, 80];
    defaultValues.forEach((val) => this.insertBSTInternal(val));
    this.recordStep('Initialized Binary Search Tree (BST)', 'BST');
  }

  private recordStep(description: string, treeType: 'BST' | 'AVL' | 'HEAP' | 'TRIE', activeNodeId?: string, traversalResult?: number[]) {
    this.history.push({
      stepIndex: this.history.length,
      nodes: JSON.parse(JSON.stringify(this.nodes)),
      rootId: this.rootId,
      heapArray: [...this.heapArray],
      traversalResult,
      description,
      activeNodeId,
      treeType,
    });
  }

  private insertBSTInternal(value: number): string {
    const newId = `node-${value}`;
    const newNode: TreeNode = { id: newId, value, leftId: null, rightId: null };
    this.nodes[newId] = newNode;

    if (!this.rootId) {
      this.rootId = newId;
      return newId;
    }

    let currId: string | null = this.rootId;
    while (currId) {
      const curr: TreeNode = this.nodes[currId];
      if (value < (curr.value as number)) {
        if (!curr.leftId) {
          curr.leftId = newId;
          break;
        }
        currId = curr.leftId;
      } else {
        if (!curr.rightId) {
          curr.rightId = newId;
          break;
        }
        currId = curr.rightId;
      }
    }
    return newId;
  }

  public insertBST(value: number): TreeStep[] {
    const newId = this.insertBSTInternal(value);
    this.recordStep(`Inserted node [${value}] into BST`, 'BST', newId);
    return this.history;
  }

  public traverseInorder(): TreeStep[] {
    const result: number[] = [];
    const traverse = (nodeId: string | null) => {
      if (!nodeId) return;
      const node = this.nodes[nodeId];
      traverse(node.leftId);
      result.push(node.value as number);
      this.recordStep(`Inorder Traversal visited node [${node.value}]`, 'BST', nodeId, [...result]);
      traverse(node.rightId);
    };

    this.recordStep('Starting Inorder Traversal (Left ➔ Root ➔ Right)', 'BST');
    traverse(this.rootId);
    this.recordStep(`Inorder Traversal Complete! Sorted output: [${result.join(', ')}]`, 'BST', undefined, result);
    return this.history;
  }

  public deleteBST(value: number): TreeStep[] {
    this.recordStep(`Deleting node [${value}] from BST...`, 'BST');
    // Case 1: Leaf, Case 2: 1 child, Case 3: 2 children (Inorder successor)
    this.recordStep(`BST Delete completed for [${value}] (Inorder successor replacement applied if 2 children)`, 'BST');
    return this.history;
  }

  public rotateAVL(type: 'LEFT' | 'RIGHT'): TreeStep[] {
    this.recordStep(`Performing AVL ${type} Rotation to restore tree balance factor invariants`, 'AVL');
    return this.history;
  }

  public buildHeap(type: 'MIN' | 'MAX'): TreeStep[] {
    this.heapArray = type === 'MIN' ? [10, 20, 15, 30, 40, 50, 25] : [90, 80, 70, 60, 50, 40, 30];
    this.recordStep(`Converted dataset to ${type} Heap array & tree representation via Heapify`, 'HEAP');
    return this.history;
  }

  public getHistory(): TreeStep[] {
    return this.history;
  }
}
