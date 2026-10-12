import { LLNode } from '../../core/types';

export interface LLStep {
  stepIndex: number;
  nodes: LLNode[];
  headId: string | null;
  description: string;
  pointers: { [name: string]: string | null };
}

export class LinkedListEngine {
  private nodes: LLNode[] = [];
  private headId: string | null = null;
  private history: LLStep[] = [];

  constructor(initialValues: number[] = [10, 20, 30, 40, 50]) {
    this.init(initialValues);
  }

  public init(values: number[]) {
    this.nodes = [];
    this.history = [];
    this.headId = null;

    let prevId: string | null = null;
    values.forEach((val, idx) => {
      const id = `node-${idx + 1}`;
      const node: LLNode = { id, value: val, nextId: null, prevId };
      if (prevId) {
        const pNode = this.nodes.find((n) => n.id === prevId);
        if (pNode) pNode.nextId = id;
      } else {
        this.headId = id;
      }
      this.nodes.push(node);
      prevId = id;
    });

    this.recordStep('Initial linked list created', { HEAD: this.headId });
  }

  private recordStep(description: string, pointers: { [name: string]: string | null }) {
    this.history.push({
      stepIndex: this.history.length,
      nodes: JSON.parse(JSON.stringify(this.nodes)),
      headId: this.headId,
      description,
      pointers,
    });
  }

  public insertHead(value: number): LLStep[] {
    const newId = `node-${Date.now() % 1000}`;
    const newNode: LLNode = { id: newId, value, nextId: this.headId, prevId: null };
    if (this.headId) {
      const oldHead = this.nodes.find((n) => n.id === this.headId);
      if (oldHead) oldHead.prevId = newId;
    }
    this.nodes.unshift(newNode);
    this.headId = newId;
    this.recordStep(`Inserted ${value} at beginning of list (Head updated)`, { HEAD: this.headId });
    return this.history;
  }

  public insertTail(value: number): LLStep[] {
    const newId = `node-${Date.now() % 1000}`;
    if (!this.headId) {
      return this.insertHead(value);
    }

    let curr: LLNode | undefined = this.nodes.find((n) => n.id === this.headId);
    while (curr && curr.nextId) {
      this.recordStep(`Traversing to end... at node [${curr.value}]`, { HEAD: this.headId, CURR: curr.id });
      curr = this.nodes.find((n) => n.id === curr!.nextId);
    }

    const newNode: LLNode = { id: newId, value, nextId: null, prevId: curr ? curr.id : null };
    if (curr) curr.nextId = newId;
    this.nodes.push(newNode);
    this.recordStep(`Inserted ${value} at end of linked list`, { HEAD: this.headId, TAIL: newId });
    return this.history;
  }

  public deleteHead(): LLStep[] {
    if (!this.headId) return this.history;
    const oldHead = this.nodes.find((n) => n.id === this.headId);
    if (!oldHead) return this.history;

    this.headId = oldHead.nextId;
    if (this.headId) {
      const newHead = this.nodes.find((n) => n.id === this.headId);
      if (newHead) newHead.prevId = null;
    }
    this.nodes = this.nodes.filter((n) => n.id !== oldHead.id);
    this.recordStep(`Deleted head node [${oldHead.value}]`, { HEAD: this.headId });
    return this.history;
  }

  public reverse(): LLStep[] {
    let prev: string | null = null;
    let currId: string | null = this.headId;

    while (currId) {
      const currNode = this.nodes.find((n) => n.id === currId);
      if (!currNode) break;

      const nextId: string | null = currNode.nextId;
      this.recordStep(`Reversing pointers for node [${currNode.value}]`, { PREV: prev, CURR: currId, NEXT: nextId });

      currNode.nextId = prev;
      currNode.prevId = nextId;
      prev = currId;
      currId = nextId;
    }

    this.headId = prev;
    this.recordStep('Linked list completely reversed!', { HEAD: this.headId });
    return this.history;
  }

  public detectCycleFastSlow(): LLStep[] {
    if (!this.headId) return this.history;

    let slowId: string | null = this.headId;
    let fastId: string | null = this.headId;

    this.recordStep("Floyd's Cycle Detection initialized: Slow & Fast pointers set to Head", { SLOW: slowId, FAST: fastId });

    while (slowId && fastId) {
      const slowNode = this.nodes.find((n) => n.id === slowId);
      const fastNode = this.nodes.find((n) => n.id === fastId);

      const nextFastId = fastNode?.nextId ? this.nodes.find((n) => n.id === fastNode.nextId)?.nextId || null : null;
      slowId = slowNode?.nextId || null;
      fastId = nextFastId;

      this.recordStep(`Advanced Slow by 1 and Fast by 2`, { SLOW: slowId, FAST: fastId });

      if (slowId === fastId && slowId !== null) {
        this.recordStep(`⚠️ Cycle Detected! Slow and Fast pointers met at node [${slowId}]`, { SLOW: slowId, FAST: fastId });
        return this.history;
      }
    }

    this.recordStep('No cycle detected in linked list (reached NULL tail)', { HEAD: this.headId });
    return this.history;
  }

  public getHistory(): LLStep[] {
    return this.history;
  }
}
