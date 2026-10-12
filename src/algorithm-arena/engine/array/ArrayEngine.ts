import { DSASimulationStep, DSAMetrics, DSAPointers } from '../../core/types';

export class ArrayEngine {
  /**
   * Traversal Operation Trace
   */
  static simulateTraversal(arr: number[]): DSASimulationStep[] {
    const steps: DSASimulationStep[] = [];
    const arrayState = [...arr];
    let comparisons = 0;
    let accesses = 0;

    for (let i = 0; i < arrayState.length; i++) {
      accesses++;
      steps.push({
        stepIndex: steps.length,
        type: 'ARRAY_ACCESS',
        arrayState: [...arrayState],
        activeIndices: [i],
        pointers: { i },
        description: `Traversing element at index [${i}] = ${arrayState[i]}`,
        metrics: { comparisons, swaps: 0, accesses, arrayMutations: 0, elapsedMs: steps.length * 50 },
      });
    }

    return steps;
  }

  /**
   * Insertion Operation Trace
   */
  static simulateInsert(arr: number[], insertIndex: number, value: number): DSASimulationStep[] {
    const steps: DSASimulationStep[] = [];
    const arrayState = [...arr];
    let accesses = 0;
    let mutations = 0;

    const idx = Math.max(0, Math.min(arrayState.length, insertIndex));

    // Shift elements right
    for (let i = arrayState.length; i > idx; i--) {
      accesses += 2;
      mutations++;
      arrayState[i] = arrayState[i - 1];
      steps.push({
        stepIndex: steps.length,
        type: 'ARRAY_OVERWRITE',
        arrayState: [...arrayState],
        activeIndices: [i, i - 1],
        pointers: { shiftFrom: i - 1, shiftTo: i },
        description: `Shifting element ${arrayState[i]} from index [${i - 1}] to [${i}]`,
        metrics: { comparisons: 0, swaps: 0, accesses, arrayMutations: mutations, elapsedMs: steps.length * 50 },
      });
    }

    arrayState[idx] = value;
    mutations++;
    steps.push({
      stepIndex: steps.length,
      type: 'ARRAY_OVERWRITE',
      arrayState: [...arrayState],
      activeIndices: [idx],
      pointers: { insertIndex: idx },
      description: `Inserted value ${value} at index [${idx}]`,
      metrics: { comparisons: 0, swaps: 0, accesses, arrayMutations: mutations, elapsedMs: steps.length * 50 },
    });

    return steps;
  }

  /**
   * Deletion Operation Trace
   */
  static simulateDelete(arr: number[], deleteIndex: number): DSASimulationStep[] {
    const steps: DSASimulationStep[] = [];
    const arrayState = [...arr];
    if (deleteIndex < 0 || deleteIndex >= arrayState.length) return steps;

    let accesses = 0;
    let mutations = 0;

    // Shift elements left
    for (let i = deleteIndex; i < arrayState.length - 1; i++) {
      accesses += 2;
      mutations++;
      arrayState[i] = arrayState[i + 1];
      steps.push({
        stepIndex: steps.length,
        type: 'ARRAY_OVERWRITE',
        arrayState: [...arrayState],
        activeIndices: [i, i + 1],
        pointers: { i },
        description: `Shifting element ${arrayState[i]} from index [${i + 1}] to [${i}]`,
        metrics: { comparisons: 0, swaps: 0, accesses, arrayMutations: mutations, elapsedMs: steps.length * 50 },
      });
    }

    arrayState.pop();
    steps.push({
      stepIndex: steps.length,
      type: 'ARRAY_OVERWRITE',
      arrayState: [...arrayState],
      activeIndices: [],
      pointers: {},
      description: `Removed element at index [${deleteIndex}]. New array size: ${arrayState.length}`,
      metrics: { comparisons: 0, swaps: 0, accesses, arrayMutations: mutations, elapsedMs: steps.length * 50 },
    });

    return steps;
  }

  /**
   * Rotation (Left Rotate by K)
   */
  static simulateRotate(arr: number[], k: number): DSASimulationStep[] {
    const steps: DSASimulationStep[] = [];
    let arrayState = [...arr];
    const n = arrayState.length;
    if (n === 0) return steps;
    const shift = ((k % n) + n) % n;

    for (let s = 0; s < shift; s++) {
      const first = arrayState[0];
      for (let i = 0; i < n - 1; i++) {
        arrayState[i] = arrayState[i + 1];
      }
      arrayState[n - 1] = first;

      steps.push({
        stepIndex: steps.length,
        type: 'ARRAY_SWAP',
        arrayState: [...arrayState],
        activeIndices: [0, n - 1],
        pointers: { shiftStep: s + 1 },
        description: `Shifted 1 step left. First element ${first} moved to end [${n - 1}]`,
        metrics: { comparisons: 0, swaps: s + 1, accesses: (s + 1) * n, arrayMutations: (s + 1) * n, elapsedMs: steps.length * 50 },
      });
    }

    return steps;
  }

  /**
   * Two Pointer Array Reversal
   */
  static simulateReversal(arr: number[]): DSASimulationStep[] {
    const steps: DSASimulationStep[] = [];
    const arrayState = [...arr];
    let left = 0;
    let right = arrayState.length - 1;
    let swaps = 0;
    let accesses = 0;

    while (left < right) {
      accesses += 2;
      swaps++;
      const temp = arrayState[left];
      arrayState[left] = arrayState[right];
      arrayState[right] = temp;

      steps.push({
        stepIndex: steps.length,
        type: 'ARRAY_SWAP',
        arrayState: [...arrayState],
        activeIndices: [left, right],
        swappingIndices: [left, right],
        pointers: { left, right },
        description: `Two Pointers: Swapped arr[${left}] (${arrayState[right]}) ↔ arr[${right}] (${arrayState[left]})`,
        metrics: { comparisons: 0, swaps, accesses, arrayMutations: swaps * 2, elapsedMs: steps.length * 50 },
      });

      left++;
      right--;
    }

    return steps;
  }

  /**
   * Kadane's Algorithm (Maximum Subarray Sum)
   */
  static simulateKadane(arr: number[]): DSASimulationStep[] {
    const steps: DSASimulationStep[] = [];
    const arrayState = [...arr];
    if (arrayState.length === 0) return steps;

    let maxSoFar = arrayState[0];
    let currentSum = arrayState[0];
    let bestStart = 0;
    let bestEnd = 0;
    let currentStart = 0;
    let comparisons = 0;
    let accesses = 1;

    steps.push({
      stepIndex: 0,
      type: 'ARRAY_ACCESS',
      arrayState: [...arrayState],
      activeIndices: [0],
      pointers: { i: 0, maxSoFar, currentSum },
      highlightRange: [0, 0],
      description: `Kadane's Init: maxSoFar = ${maxSoFar}, currentSum = ${currentSum} at index [0]`,
      metrics: { comparisons: 0, swaps: 0, accesses: 1, arrayMutations: 0, elapsedMs: 0 },
    });

    for (let i = 1; i < arrayState.length; i++) {
      accesses++;
      comparisons++;

      if (currentSum + arrayState[i] < arrayState[i]) {
        currentSum = arrayState[i];
        currentStart = i;
      } else {
        currentSum += arrayState[i];
      }

      if (currentSum > maxSoFar) {
        maxSoFar = currentSum;
        bestStart = currentStart;
        bestEnd = i;
      }

      steps.push({
        stepIndex: steps.length,
        type: 'ARRAY_ACCESS',
        arrayState: [...arrayState],
        activeIndices: [i],
        pointers: { i, currentSum, maxSoFar },
        highlightRange: [bestStart, bestEnd],
        description: `Index [${i}] = ${arrayState[i]}: currentSum = ${currentSum}, maxSoFar = ${maxSoFar} (Max Subarray range: [${bestStart}..${bestEnd}])`,
        metrics: { comparisons, swaps: 0, accesses, arrayMutations: 0, elapsedMs: steps.length * 50 },
      });
    }

    return steps;
  }

  /**
   * Dutch National Flag Algorithm (Sort 0s, 1s, and 2s)
   */
  static simulateDutchNationalFlag(arr: number[]): DSASimulationStep[] {
    const steps: DSASimulationStep[] = [];
    const arrayState = [...arr];
    let low = 0;
    let mid = 0;
    let high = arrayState.length - 1;
    let swaps = 0;
    let comparisons = 0;
    let accesses = 0;

    while (mid <= high) {
      accesses++;
      comparisons++;
      const val = arrayState[mid];

      if (val === 0) {
        swaps++;
        const temp = arrayState[low];
        arrayState[low] = arrayState[mid];
        arrayState[mid] = temp;

        steps.push({
          stepIndex: steps.length,
          type: 'ARRAY_SWAP',
          arrayState: [...arrayState],
          activeIndices: [low, mid],
          swappingIndices: [low, mid],
          pointers: { low, mid, high },
          description: `Val 0 at mid [${mid}]: Swapped with low [${low}]. Advanced low & mid`,
          metrics: { comparisons, swaps, accesses, arrayMutations: swaps * 2, elapsedMs: steps.length * 50 },
        });

        low++;
        mid++;
      } else if (val === 1) {
        steps.push({
          stepIndex: steps.length,
          type: 'ARRAY_ACCESS',
          arrayState: [...arrayState],
          activeIndices: [mid],
          pointers: { low, mid, high },
          description: `Val 1 at mid [${mid}]: In correct middle partition. Advanced mid`,
          metrics: { comparisons, swaps, accesses, arrayMutations: swaps * 2, elapsedMs: steps.length * 50 },
        });

        mid++;
      } else {
        // val === 2
        swaps++;
        const temp = arrayState[mid];
        arrayState[mid] = arrayState[high];
        arrayState[high] = temp;

        steps.push({
          stepIndex: steps.length,
          type: 'ARRAY_SWAP',
          arrayState: [...arrayState],
          activeIndices: [mid, high],
          swappingIndices: [mid, high],
          pointers: { low, mid, high },
          description: `Val 2 at mid [${mid}]: Swapped with high [${high}]. Decremented high`,
          metrics: { comparisons, swaps, accesses, arrayMutations: swaps * 2, elapsedMs: steps.length * 50 },
        });

        high--;
      }
    }

    return steps;
  }
}
