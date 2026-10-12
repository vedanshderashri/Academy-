export interface StringBitStep {
  stepIndex: number;
  text?: string;
  pattern?: string;
  matchIndex?: number;
  lpsArray?: number[];
  bitNum1?: number;
  bitNum2?: number;
  bitResult?: number;
  bitOp?: string;
  description: string;
  type: 'KMP' | 'BITWISE';
}

export class StringBitEngine {
  private history: StringBitStep[] = [];

  constructor() {
    this.runKMP('ABABDABACDABABCABAB', 'ABABCABAB');
  }

  private recordStep(description: string, type: 'KMP' | 'BITWISE', text?: string, pattern?: string, matchIndex?: number, lpsArray?: number[], bitNum1?: number, bitNum2?: number, bitResult?: number, bitOp?: string) {
    this.history.push({
      stepIndex: this.history.length,
      text,
      pattern,
      matchIndex,
      lpsArray,
      bitNum1,
      bitNum2,
      bitResult,
      bitOp,
      description,
      type,
    });
  }

  public runKMP(text: string = 'ABABDABACDABABCABAB', pattern: string = 'ABABCABAB'): StringBitStep[] {
    this.history = [];
    const M = pattern.length;
    const N = text.length;
    const lps: number[] = Array(M).fill(0);

    let len = 0;
    let i = 1;
    while (i < M) {
      if (pattern[i] === pattern[len]) {
        len++;
        lps[i] = len;
        i++;
      } else {
        if (len !== 0) len = lps[len - 1];
        else {
          lps[i] = 0;
          i++;
        }
      }
    }

    this.recordStep(`Built KMP Longest Prefix Suffix (LPS) Array: [${lps.join(', ')}]`, 'KMP', text, pattern, -1, [...lps]);

    i = 0;
    let j = 0;
    while (i < N) {
      this.recordStep(`Comparing text[${i}] ('${text[i]}') with pattern[${j}] ('${pattern[j]}')`, 'KMP', text, pattern, i - j, [...lps]);

      if (pattern[j] === text[i]) {
        j++;
        i++;
      }

      if (j === M) {
        this.recordStep(`🎉 KMP Pattern Match found at text index ${i - j}!`, 'KMP', text, pattern, i - j, [...lps]);
        j = lps[j - 1];
      } else if (i < N && pattern[j] !== text[i]) {
        if (j !== 0) {
          j = lps[j - 1];
          this.recordStep(`Mismatch! Shifted pattern via LPS table to index ${j}`, 'KMP', text, pattern, i - j, [...lps]);
        } else {
          i++;
        }
      }
    }

    return this.history;
  }

  public runBitwise(a: number = 29, b: number = 15, op: 'AND' | 'OR' | 'XOR' | 'LSHIFT' | 'RSHIFT'): StringBitStep[] {
    this.history = [];
    let res = 0;
    if (op === 'AND') res = a & b;
    else if (op === 'OR') res = a | b;
    else if (op === 'XOR') res = a ^ b;
    else if (op === 'LSHIFT') res = a << 2;
    else if (op === 'RSHIFT') res = a >> 2;

    this.recordStep(
      `Evaluated ${a} (${a.toString(2).padStart(8, '0')}) ${op} ${b} (${b.toString(2).padStart(8, '0')}) = ${res} (${res.toString(2).padStart(8, '0')})`,
      'BITWISE',
      undefined,
      undefined,
      undefined,
      undefined,
      a,
      b,
      res,
      op
    );

    return this.history;
  }

  public getHistory(): StringBitStep[] {
    return this.history;
  }
}
