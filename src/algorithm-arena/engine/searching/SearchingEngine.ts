import { DSASimulationStep } from '../../core/types';

export class SearchingEngine {
  /**
   * Linear Search Simulation
   */
  static simulateLinearSearch(arr: number[], target: number): DSASimulationStep[] {
    const steps: DSASimulationStep[] = [];
    const arrayState = [...arr];
    let comparisons = 0;
    let accesses = 0;

    for (let i = 0; i < arrayState.length; i++) {
      accesses++;
      comparisons++;
      const val = arrayState[i];
      const isMatch = val === target;

      steps.push({
        stepIndex: steps.length,
        type: 'COMPARISON',
        arrayState: [...arrayState],
        activeIndices: [i],
        comparingIndices: [i],
        pointers: { i, target },
        description: `Linear Search at index [${i}]: Comparing arr[${i}] (${val}) == target (${target}) -> ${isMatch ? 'MATCH FOUND ✓' : 'NO MATCH'}`,
        metrics: { comparisons, swaps: 0, accesses, arrayMutations: 0, elapsedMs: steps.length * 50 },
      });

      if (isMatch) break;
    }

    return steps;
  }

  /**
   * Iterative Binary Search Simulation
   */
  static simulateBinarySearch(arr: number[], target: number): DSASimulationStep[] {
    const steps: DSASimulationStep[] = [];
    const arrayState = [...arr].sort((a, b) => a - b); // Ensure sorted for binary search
    let low = 0;
    let high = arrayState.length - 1;
    let comparisons = 0;
    let accesses = 0;

    steps.push({
      stepIndex: 0,
      type: 'POINTER_MOVE',
      arrayState: [...arrayState],
      activeIndices: [],
      pointers: { low, high, target },
      highlightRange: [low, high],
      description: `Binary Search Init (Sorted Array): low = ${low}, high = ${high}, target = ${target}`,
      metrics: { comparisons: 0, swaps: 0, accesses: 0, arrayMutations: 0, elapsedMs: 0 },
    });

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      accesses++;
      comparisons++;
      const midVal = arrayState[mid];

      if (midVal === target) {
        steps.push({
          stepIndex: steps.length,
          type: 'COMPARISON',
          arrayState: [...arrayState],
          activeIndices: [mid],
          comparingIndices: [mid],
          sortedIndices: [mid],
          pointers: { low, mid, high, target },
          highlightRange: [low, high],
          description: `Mid index [${mid}] = ${midVal} == target (${target}). MATCH FOUND AT INDEX [${mid}] ✓!`,
          metrics: { comparisons, swaps: 0, accesses, arrayMutations: 0, elapsedMs: steps.length * 50 },
        });
        return steps;
      } else if (midVal < target) {
        steps.push({
          stepIndex: steps.length,
          type: 'COMPARISON',
          arrayState: [...arrayState],
          activeIndices: [mid],
          comparingIndices: [mid],
          pointers: { low, mid, high, target },
          highlightRange: [low, high],
          description: `Mid index [${mid}] = ${midVal} < target (${target}). Target is in right half -> Shift low = ${mid + 1}`,
          metrics: { comparisons, swaps: 0, accesses, arrayMutations: 0, elapsedMs: steps.length * 50 },
        });
        low = mid + 1;
      } else {
        steps.push({
          stepIndex: steps.length,
          type: 'COMPARISON',
          arrayState: [...arrayState],
          activeIndices: [mid],
          comparingIndices: [mid],
          pointers: { low, mid, high, target },
          highlightRange: [low, high],
          description: `Mid index [${mid}] = ${midVal} > target (${target}). Target is in left half -> Shift high = ${mid - 1}`,
          metrics: { comparisons, swaps: 0, accesses, arrayMutations: 0, elapsedMs: steps.length * 50 },
        });
        high = mid - 1;
      }
    }

    steps.push({
      stepIndex: steps.length,
      type: 'POINTER_MOVE',
      arrayState: [...arrayState],
      activeIndices: [],
      pointers: { low, high, target },
      description: `Search interval exhausted (low ${low} > high ${high}). Target ${target} NOT FOUND in array ✖.`,
      metrics: { comparisons, swaps: 0, accesses, arrayMutations: 0, elapsedMs: steps.length * 50 },
    });

    return steps;
  }
}
