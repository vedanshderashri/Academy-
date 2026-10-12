export interface StackQueueStep {
  stepIndex: number;
  stackItems: number[];
  queueItems: number[];
  infixExpr?: string;
  postfixExpr?: string;
  charPointer?: number;
  description: string;
  opType: 'PUSH' | 'POP' | 'ENQUEUE' | 'DEQUEUE' | 'INFIX_POSTFIX';
}

export class StackQueueEngine {
  private stack: number[] = [15, 30, 45];
  private queue: number[] = [100, 200, 300];
  private history: StackQueueStep[] = [];

  constructor() {
    this.recordStep('Initialized Stack & Queue structures', 'PUSH');
  }

  private recordStep(description: string, opType: 'PUSH' | 'POP' | 'ENQUEUE' | 'DEQUEUE' | 'INFIX_POSTFIX', infix?: string, postfix?: string, charPointer?: number) {
    this.history.push({
      stepIndex: this.history.length,
      stackItems: [...this.stack],
      queueItems: [...this.queue],
      infixExpr: infix,
      postfixExpr: postfix,
      charPointer,
      description,
      opType,
    });
  }

  public pushStack(val: number): StackQueueStep[] {
    if (this.stack.length >= 8) {
      this.recordStep('⚠️ Stack Overflow! Max capacity (8) reached.', 'PUSH');
      return this.history;
    }
    this.stack.push(val);
    this.recordStep(`Pushed element [${val}] onto Stack top`, 'PUSH');
    return this.history;
  }

  public popStack(): StackQueueStep[] {
    if (this.stack.length === 0) {
      this.recordStep('⚠️ Stack Underflow! Stack is empty.', 'POP');
      return this.history;
    }
    const popped = this.stack.pop();
    this.recordStep(`Popped element [${popped}] from Stack top`, 'POP');
    return this.history;
  }

  public enqueue(val: number): StackQueueStep[] {
    if (this.queue.length >= 8) {
      this.recordStep('⚠️ Queue Overflow! Max capacity (8) reached.', 'ENQUEUE');
      return this.history;
    }
    this.queue.push(val);
    this.recordStep(`Enqueued element [${val}] to Queue REAR`, 'ENQUEUE');
    return this.history;
  }

  public dequeue(): StackQueueStep[] {
    if (this.queue.length === 0) {
      this.recordStep('⚠️ Queue Underflow! Queue is empty.', 'DEQUEUE');
      return this.history;
    }
    const dequeued = this.queue.shift();
    this.recordStep(`Dequeued element [${dequeued}] from Queue FRONT`, 'DEQUEUE');
    return this.history;
  }

  public convertInfixToPostfix(infix: string = 'A+B*(C-D)'): StackQueueStep[] {
    const opStack: string[] = [];
    let postfix = '';

    const precedence = (op: string) => {
      if (op === '+' || op === '-') return 1;
      if (op === '*' || op === '/') return 2;
      if (op === '^') return 3;
      return 0;
    };

    this.recordStep(`Beginning Infix to Postfix conversion for "${infix}"`, 'INFIX_POSTFIX', infix, postfix, 0);

    for (let i = 0; i < infix.length; i++) {
      const ch = infix[i];
      if (/[A-Za-z0-9]/.test(ch)) {
        postfix += ch;
        this.recordStep(`Operand '${ch}' appended directly to output: "${postfix}"`, 'INFIX_POSTFIX', infix, postfix, i);
      } else if (ch === '(') {
        opStack.push(ch);
        this.recordStep(`Left parenthesis '(' pushed to Operator Stack`, 'INFIX_POSTFIX', infix, postfix, i);
      } else if (ch === ')') {
        while (opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
          postfix += opStack.pop();
        }
        opStack.pop(); // pop '('
        this.recordStep(`Right parenthesis ')' encountered: popped until '('`, 'INFIX_POSTFIX', infix, postfix, i);
      } else {
        while (opStack.length > 0 && precedence(opStack[opStack.length - 1]) >= precedence(ch)) {
          postfix += opStack.pop();
        }
        opStack.push(ch);
        this.recordStep(`Operator '${ch}' pushed to Stack (precedence evaluated)`, 'INFIX_POSTFIX', infix, postfix, i);
      }
    }

    while (opStack.length > 0) {
      postfix += opStack.pop();
    }

    this.recordStep(`Conversion completed! Result Postfix Expression: "${postfix}"`, 'INFIX_POSTFIX', infix, postfix, infix.length);
    return this.history;
  }

  public getHistory(): StackQueueStep[] {
    return this.history;
  }
}
