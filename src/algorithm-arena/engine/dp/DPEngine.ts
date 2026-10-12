export interface DPStep {
  stepIndex: number;
  matrix: number[][];
  rowLabels: string[];
  colLabels: string[];
  activeCell?: [number, number];
  description: string;
  opType: 'FIBONACCI' | 'KNAPSACK' | 'LCS';
}

export class DPEngine {
  private history: DPStep[] = [];

  constructor() {
    this.run01Knapsack();
  }

  private recordStep(matrix: number[][], rowLabels: string[], colLabels: string[], description: string, opType: 'FIBONACCI' | 'KNAPSACK' | 'LCS', activeCell?: [number, number]) {
    this.history.push({
      stepIndex: this.history.length,
      matrix: JSON.parse(JSON.stringify(matrix)),
      rowLabels,
      colLabels,
      activeCell,
      description,
      opType,
    });
  }

  public run01Knapsack(weights: number[] = [2, 3, 4, 5], values: number[] = [3, 4, 5, 6], maxCap: number = 5): DPStep[] {
    this.history = [];
    const n = weights.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(maxCap + 1).fill(0));
    const rowLabels = ['Ø', ...weights.map((w, i) => `Item ${i + 1} (w:${w}, v:${values[i]})`)];
    const colLabels = Array.from({ length: maxCap + 1 }, (_, i) => `w:${i}`);

    this.recordStep(dp, rowLabels, colLabels, 'Initialized 0/1 Knapsack DP Table (Base cases = 0)', 'KNAPSACK');

    for (let i = 1; i <= n; i++) {
      const wt = weights[i - 1];
      const val = values[i - 1];

      for (let w = 1; w <= maxCap; w++) {
        if (wt <= w) {
          dp[i][w] = Math.max(val + dp[i - 1][w - wt], dp[i - 1][w]);
          this.recordStep(
            dp,
            rowLabels,
            colLabels,
            `Item ${i} fits in cap ${w}: max(include=${val} + dp[${i - 1}][${w - wt}], exclude=${dp[i - 1][w]}) = ${dp[i][w]}`,
            'KNAPSACK',
            [i, w]
          );
        } else {
          dp[i][w] = dp[i - 1][w];
          this.recordStep(
            dp,
            rowLabels,
            colLabels,
            `Item ${i} (w:${wt}) exceeds capacity ${w}: carry forward dp[${i - 1}][${w}] = ${dp[i][w]}`,
            'KNAPSACK',
            [i, w]
          );
        }
      }
    }

    this.recordStep(dp, rowLabels, colLabels, `0/1 Knapsack Complete! Max value attainable = ${dp[n][maxCap]}`, 'KNAPSACK', [n, maxCap]);
    return this.history;
  }

  public runLCS(text1: string = 'STONE', text2: string = 'LONGEST'): DPStep[] {
    this.history = [];
    const m = text1.length;
    const n = text2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    const rowLabels = ['Ø', ...text1.split('')];
    const colLabels = ['Ø', ...text2.split('')];

    this.recordStep(dp, rowLabels, colLabels, `Initialized LCS Table for "${text1}" vs "${text2}"`, 'LCS');

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (text1[i - 1] === text2[j - 1]) {
          dp[i][j] = 1 + dp[i - 1][j - 1];
          this.recordStep(
            dp,
            rowLabels,
            colLabels,
            `Match found '${text1[i - 1]}' === '${text2[j - 1]}'! 1 + dp[${i - 1}][${j - 1}] = ${dp[i][j]}`,
            'LCS',
            [i, j]
          );
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          this.recordStep(
            dp,
            rowLabels,
            colLabels,
            `Mismatch '${text1[i - 1]}' !== '${text2[j - 1]}': max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = ${dp[i][j]}`,
            'LCS',
            [i, j]
          );
        }
      }
    }

    this.recordStep(dp, rowLabels, colLabels, `Longest Common Subsequence Length = ${dp[m][n]}`, 'LCS', [m, n]);
    return this.history;
  }

  public getHistory(): DPStep[] {
    return this.history;
  }
}
