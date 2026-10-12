import { DSASimulationStep } from '../../core/types';

export class SortingEngine {
  /**
   * Bubble Sort Simulation
   */
  static simulateBubbleSort(arr: number[]): DSASimulationStep[] {
    const steps: DSASimulationStep[] = [];
    const arrayState = [...arr];
    const n = arrayState.length;
    let comparisons = 0;
    let swaps = 0;
    let accesses = 0;
    const sortedIndices: number[] = [];

    for (let i = 0; i < n - 1; i++) {
      let swappedInPass = false;
      for (let j = 0; j < n - i - 1; j++) {
        accesses += 2;
        comparisons++;
        const val1 = arrayState[j];
        const val2 = arrayState[j + 1];

        if (val1 > val2) {
          swaps++;
          swappedInPass = true;
          arrayState[j] = val2;
          arrayState[j + 1] = val1;

          steps.push({
            stepIndex: steps.length,
            type: 'ARRAY_SWAP',
            arrayState: [...arrayState],
            activeIndices: [j, j + 1],
            swappingIndices: [j, j + 1],
            sortedIndices: [...sortedIndices],
            pointers: { i, j, 'j+1': j + 1 },
            description: `Bubble Sort: arr[${j}] (${val1}) > arr[${j + 1}] (${val2}) → Swapped!`,
            metrics: { comparisons, swaps, accesses, arrayMutations: swaps * 2, elapsedMs: steps.length * 50 },
          });
        } else {
          steps.push({
            stepIndex: steps.length,
            type: 'COMPARISON',
            arrayState: [...arrayState],
            activeIndices: [j, j + 1],
            comparingIndices: [j, j + 1],
            sortedIndices: [...sortedIndices],
            pointers: { i, j, 'j+1': j + 1 },
            description: `Bubble Sort: arr[${j}] (${val1}) ≤ arr[${j + 1}] (${val2}) → In order`,
            metrics: { comparisons, swaps, accesses, arrayMutations: swaps * 2, elapsedMs: steps.length * 50 },
          });
        }
      }
      sortedIndices.push(n - i - 1);
      if (!swappedInPass) break;
    }

    return steps;
  }

  /**
   * Selection Sort Simulation
   */
  static simulateSelectionSort(arr: number[]): DSASimulationStep[] {
    const steps: DSASimulationStep[] = [];
    const arrayState = [...arr];
    const n = arrayState.length;
    let comparisons = 0;
    let swaps = 0;
    let accesses = 0;
    const sortedIndices: number[] = [];

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      steps.push({
        stepIndex: steps.length,
        type: 'POINTER_MOVE',
        arrayState: [...arrayState],
        activeIndices: [i],
        pointers: { i, minIdx },
        sortedIndices: [...sortedIndices],
        description: `Selection Sort Pass ${i + 1}: Searching for minimum element from index [${i}]`,
        metrics: { comparisons, swaps, accesses, arrayMutations: swaps * 2, elapsedMs: steps.length * 50 },
      });

      for (let j = i + 1; j < n; j++) {
        accesses += 2;
        comparisons++;
        if (arrayState[j] < arrayState[minIdx]) {
          minIdx = j;
        }

        steps.push({
          stepIndex: steps.length,
          type: 'COMPARISON',
          arrayState: [...arrayState],
          activeIndices: [j, minIdx],
          comparingIndices: [j, minIdx],
          pointers: { i, j, minIdx },
          sortedIndices: [...sortedIndices],
          description: `Comparing arr[${j}] (${arrayState[j]}) with current min arr[${minIdx}] (${arrayState[minIdx]})`,
          metrics: { comparisons, swaps, accesses, arrayMutations: swaps * 2, elapsedMs: steps.length * 50 },
        });
      }

      if (minIdx !== i) {
        swaps++;
        const temp = arrayState[i];
        arrayState[i] = arrayState[minIdx];
        arrayState[minIdx] = temp;

        steps.push({
          stepIndex: steps.length,
          type: 'ARRAY_SWAP',
          arrayState: [...arrayState],
          activeIndices: [i, minIdx],
          swappingIndices: [i, minIdx],
          pointers: { i, minIdx },
          sortedIndices: [...sortedIndices, i],
          description: `Swapped minimum element ${arrayState[i]} at [${minIdx}] to position [${i}]`,
          metrics: { comparisons, swaps, accesses, arrayMutations: swaps * 2, elapsedMs: steps.length * 50 },
        });
      }
      sortedIndices.push(i);
    }

    return steps;
  }

  /**
   * Insertion Sort Simulation
   */
  static simulateInsertionSort(arr: number[]): DSASimulationStep[] {
    const steps: DSASimulationStep[] = [];
    const arrayState = [...arr];
    const n = arrayState.length;
    let comparisons = 0;
    let swaps = 0;
    let accesses = 0;

    for (let i = 1; i < n; i++) {
      const key = arrayState[i];
      let j = i - 1;

      steps.push({
        stepIndex: steps.length,
        type: 'POINTER_MOVE',
        arrayState: [...arrayState],
        activeIndices: [i],
        pointers: { i, key },
        description: `Insertion Sort Pass ${i}: Inserting key ${key} into sorted prefix [0..${i - 1}]`,
        metrics: { comparisons, swaps, accesses, arrayMutations: swaps * 2, elapsedMs: steps.length * 50 },
      });

      while (j >= 0 && arrayState[j] > key) {
        accesses += 2;
        comparisons++;
        swaps++;
        arrayState[j + 1] = arrayState[j];

        steps.push({
          stepIndex: steps.length,
          type: 'ARRAY_OVERWRITE',
          arrayState: [...arrayState],
          activeIndices: [j, j + 1],
          pointers: { i, j, 'j+1': j + 1, key },
          description: `Shifted element ${arrayState[j]} right from [${j}] to [${j + 1}]`,
          metrics: { comparisons, swaps, accesses, arrayMutations: swaps * 2, elapsedMs: steps.length * 50 },
        });

        j--;
      }

      arrayState[j + 1] = key;
      steps.push({
        stepIndex: steps.length,
        type: 'ARRAY_OVERWRITE',
        arrayState: [...arrayState],
        activeIndices: [j + 1],
        pointers: { i, keyIndex: j + 1 },
        description: `Placed key ${key} at position [${j + 1}]`,
        metrics: { comparisons, swaps, accesses, arrayMutations: swaps * 2, elapsedMs: steps.length * 50 },
      });
    }

    return steps;
  }

  /**
   * Quick Sort Simulation
   */
  static simulateQuickSort(arr: number[]): DSASimulationStep[] {
    const steps: DSASimulationStep[] = [];
    const arrayState = [...arr];
    let comparisons = 0;
    let swaps = 0;
    let accesses = 0;

    const partition = (low: number, high: number): number => {
      const pivot = arrayState[high];
      let i = low - 1;

      steps.push({
        stepIndex: steps.length,
        type: 'PIVOT_SELECT',
        arrayState: [...arrayState],
        activeIndices: [high],
        pointers: { low, high, pivot },
        highlightRange: [low, high],
        description: `Quick Sort Partition [${low}..${high}]: Chosen pivot = ${pivot} at index [${high}]`,
        metrics: { comparisons, swaps, accesses, arrayMutations: swaps * 2, elapsedMs: steps.length * 50 },
      });

      for (let j = low; j < high; j++) {
        accesses += 2;
        comparisons++;
        if (arrayState[j] < pivot) {
          i++;
          swaps++;
          const temp = arrayState[i];
          arrayState[i] = arrayState[j];
          arrayState[j] = temp;

          steps.push({
            stepIndex: steps.length,
            type: 'ARRAY_SWAP',
            arrayState: [...arrayState],
            activeIndices: [i, j],
            swappingIndices: [i, j],
            pointers: { low, high, i, j, pivot },
            description: `arr[${j}] (${arrayState[i]}) < pivot (${pivot}) → Swapped to left partition [${i}]`,
            metrics: { comparisons, swaps, accesses, arrayMutations: swaps * 2, elapsedMs: steps.length * 50 },
          });
        }
      }

      swaps++;
      const temp = arrayState[i + 1];
      arrayState[i + 1] = arrayState[high];
      arrayState[high] = temp;

      steps.push({
        stepIndex: steps.length,
        type: 'ARRAY_SWAP',
        arrayState: [...arrayState],
        activeIndices: [i + 1, high],
        swappingIndices: [i + 1, high],
        pointers: { pivotIndex: i + 1 },
        description: `Placed pivot ${pivot} at final sorted partition index [${i + 1}]`,
        metrics: { comparisons, swaps, accesses, arrayMutations: swaps * 2, elapsedMs: steps.length * 50 },
      });

      return i + 1;
    };

    const quickSortHelper = (low: number, high: number) => {
      if (low < high) {
        const pi = partition(low, high);
        quickSortHelper(low, pi - 1);
        quickSortHelper(pi + 1, high);
      }
    };

    quickSortHelper(0, arrayState.length - 1);
    return steps;
  }
}
