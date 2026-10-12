export interface BacktrackStep {
  stepIndex: number;
  board: number[][]; // N x N grid (1 for Queen/Path, 0 for empty, -1 for invalid)
  queensPlaced: number;
  description: string;
  activeRow?: number;
  activeCol?: number;
  type: 'TRY' | 'BACKTRACK' | 'SUCCESS';
}

export class BacktrackingEngine {
  private history: BacktrackStep[] = [];

  constructor() {
    this.solveNQueens(4);
  }

  private recordStep(board: number[][], queensPlaced: number, description: string, type: 'TRY' | 'BACKTRACK' | 'SUCCESS', activeRow?: number, activeCol?: number) {
    this.history.push({
      stepIndex: this.history.length,
      board: JSON.parse(JSON.stringify(board)),
      queensPlaced,
      description,
      type,
      activeRow,
      activeCol,
    });
  }

  public solveNQueens(N: number = 4): BacktrackStep[] {
    this.history = [];
    const board: number[][] = Array.from({ length: N }, () => Array(N).fill(0));

    const isSafe = (b: number[][], row: number, col: number) => {
      for (let i = 0; i < col; i++) if (b[row][i] === 1) return false;
      for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) if (b[i][j] === 1) return false;
      for (let i = row, j = col; j >= 0 && i < N; i++, j--) if (b[i][j] === 1) return false;
      return true;
    };

    const solve = (col: number): boolean => {
      if (col >= N) {
        this.recordStep(board, N, `🎉 All ${N} Queens successfully placed without conflicts!`, 'SUCCESS');
        return true;
      }

      for (let i = 0; i < N; i++) {
        this.recordStep(board, col, `Testing Queen placement at Row ${i}, Col ${col}...`, 'TRY', i, col);

        if (isSafe(board, i, col)) {
          board[i][col] = 1;
          this.recordStep(board, col + 1, `Safe spot! Queen placed at Row ${i}, Col ${col}`, 'TRY', i, col);

          if (solve(col + 1)) return true;

          board[i][col] = 0; // BACKTRACK
          this.recordStep(board, col, `Backtracking: Removed Queen from Row ${i}, Col ${col}`, 'BACKTRACK', i, col);
        } else {
          this.recordStep(board, col, `Conflict detected at Row ${i}, Col ${col}! Moving to next position.`, 'TRY', i, col);
        }
      }
      return false;
    };

    this.recordStep(board, 0, `Starting ${N}-Queens Backtracking Solver`, 'TRY');
    solve(0);
    return this.history;
  }

  public getHistory(): BacktrackStep[] {
    return this.history;
  }
}
