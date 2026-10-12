import { NFAModel, NFASimulationStep, DFAModel, DFAState, DFATransition, SymbolChar } from '../../core/types';

export class NFAEngine {
  private model: NFAModel | null = null;

  loadModel(model: NFAModel): void {
    this.model = model;
  }

  /**
   * Compute Epsilon Closure ε-closure(states)
   */
  epsilonClosure(stateIds: string[]): string[] {
    if (!this.model) return [];
    const closureSet = new Set<string>(stateIds);
    const stack = [...stateIds];

    while (stack.length > 0) {
      const stateId = stack.pop()!;
      const epsilonTrans = this.model.transitions.filter(
        (t) => t.fromStateId === stateId && (t.symbol === 'ε' || t.symbol === '')
      );

      for (const t of epsilonTrans) {
        if (!closureSet.has(t.toStateId)) {
          closureSet.add(t.toStateId);
          stack.push(t.toStateId);
        }
      }
    }

    return Array.from(closureSet);
  }

  /**
   * Compute single step transition from set of active states over a symbol
   */
  move(stateIds: string[], symbol: SymbolChar): string[] {
    if (!this.model) return [];
    const targetSet = new Set<string>();

    for (const sid of stateIds) {
      const transitions = this.model.transitions.filter(
        (t) => t.fromStateId === sid && t.symbol === symbol
      );
      for (const t of transitions) {
        targetSet.add(t.toStateId);
      }
    }

    return Array.from(targetSet);
  }

  /**
   * Run step-by-step NFA simulation
   */
  simulate(inputString: string): NFASimulationStep[] {
    if (!this.model) throw new Error('NFA model not loaded.');

    const startState = this.model.states.find((s) => s.isStart || s.id === this.model!.startStateId);
    if (!startState) throw new Error('NFA has no start state.');

    let currentStates = this.epsilonClosure([startState.id]);
    const inputChars = inputString === 'ε' ? [] : inputString.split('');
    const history: NFASimulationStep[] = [];

    const isStartAccepted = currentStates.some((id) =>
      this.model!.states.find((s) => s.id === id)?.isAccepting
    );

    history.push({
      stepIndex: 0,
      activeStateIds: currentStates,
      readSymbol: null,
      remainingInput: inputString,
      transitionsTakenIds: [],
      isAccepted: inputChars.length === 0 ? isStartAccepted : null,
      explanation: `Started at state '${startState.name}' with ε-closure -> active states {${currentStates.map((id) => this.model!.states.find((s) => s.id === id)?.name).join(', ')}}.`,
    });

    let remaining = inputString;
    for (let i = 0; i < inputChars.length; i++) {
      const sym = inputChars[i];
      remaining = remaining.substring(1);

      const moveStates = this.move(currentStates, sym);
      currentStates = this.epsilonClosure(moveStates);

      const isLast = i === inputChars.length - 1;
      const isAccepted = isLast
        ? currentStates.some((id) => this.model!.states.find((s) => s.id === id)?.isAccepting)
        : null;

      history.push({
        stepIndex: i + 1,
        activeStateIds: currentStates,
        readSymbol: sym,
        remainingInput: remaining,
        transitionsTakenIds: [],
        isAccepted,
        explanation: `Read symbol '${sym}' -> Active states now {${currentStates.map((id) => this.model!.states.find((s) => s.id === id)?.name).join(', ')}}.`,
      });
    }

    return history;
  }

  /**
   * Convert NFA to Equivalent DFA using Subset Construction Algorithm
   */
  static convertNFAtoDFA(nfa: NFAModel): DFAModel {
    const engine = new NFAEngine();
    engine.loadModel(nfa);

    const startState = nfa.states.find((s) => s.isStart || s.id === nfa.startStateId);
    if (!startState) throw new Error('NFA has no start state for subset construction.');

    const initialClosure = engine.epsilonClosure([startState.id]).sort();
    const closureKey = (ids: string[]) => ids.sort().join(',');

    const dfaStates: DFAState[] = [];
    const dfaTransitions: DFATransition[] = [];
    const stateMap = new Map<string, string>(); // closureKey -> dfaStateId

    const getOrCreateDFAState = (closure: string[]): string => {
      const key = closureKey(closure);
      if (stateMap.has(key)) return stateMap.get(key)!;

      const dfaId = `dfa-q${dfaStates.length}`;
      const name = closure.length === 0 ? '∅' : `{${closure.map((id) => nfa.states.find((s) => s.id === id)?.name).join(',')}}`;
      const isAccepting = closure.some((id) => nfa.states.find((s) => s.id === id)?.isAccepting);
      const isStart = dfaStates.length === 0;

      const newDFAState: DFAState = {
        id: dfaId,
        name,
        isStart,
        isAccepting,
        x: 150 + (dfaStates.length % 4) * 160,
        y: 150 + Math.floor(dfaStates.length / 4) * 120,
      };

      dfaStates.push(newDFAState);
      stateMap.set(key, dfaId);
      return dfaId;
    };

    const startDFAId = getOrCreateDFAState(initialClosure);
    const queue: string[][] = [initialClosure];
    const visited = new Set<string>([closureKey(initialClosure)]);

    while (queue.length > 0) {
      const currentClosure = queue.shift()!;
      const currentDFAId = stateMap.get(closureKey(currentClosure))!;

      for (const sym of nfa.alphabet) {
        if (sym === 'ε' || sym === '') continue;
        const moveStates = engine.move(currentClosure, sym);
        const nextClosure = engine.epsilonClosure(moveStates).sort();
        const nextKey = closureKey(nextClosure);

        const nextDFAId = getOrCreateDFAState(nextClosure);

        dfaTransitions.push({
          id: `trans-${currentDFAId}-${nextDFAId}-${sym}`,
          fromStateId: currentDFAId,
          toStateId: nextDFAId,
          symbol: sym,
        });

        if (!visited.has(nextKey)) {
          visited.add(nextKey);
          queue.push(nextClosure);
        }
      }
    }

    return {
      id: `dfa-converted-${Date.now()}`,
      name: `DFA (Converted from ${nfa.name})`,
      alphabet: nfa.alphabet.filter((sym) => sym !== 'ε' && sym !== ''),
      states: dfaStates,
      transitions: dfaTransitions,
      startStateId: startDFAId,
    };
  }
}
