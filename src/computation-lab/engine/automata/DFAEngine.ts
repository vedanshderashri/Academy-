import { DFAModel, DFASimulationStep, ISimulationEngine, SymbolChar } from '../../core/types';
import { StringOps } from '../formal-language/StringOps';

export class DFAEngine implements ISimulationEngine<DFAModel, DFASimulationStep> {
  private model: DFAModel | null = null;
  private currentStateId: string = '';
  private currentStepIndex: number = 0;
  private remainingInput: string = '';
  private history: DFASimulationStep[] = [];
  private isTerminated: boolean = false;

  loadModel(model: DFAModel): void {
    this.model = model;
  }

  validate(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.model) {
      return { valid: false, errors: ['No DFA model loaded.'], warnings: [] };
    }

    if (!this.model.states.length) {
      errors.push('DFA must contain at least one state.');
    }

    const startState = this.model.states.find((s) => s.id === this.model!.startStateId || s.isStart);
    if (!startState) {
      errors.push('DFA must have a designated start state.');
    }

    const acceptingStates = this.model.states.filter((s) => s.isAccepting);
    if (acceptingStates.length === 0) {
      warnings.push('DFA has no accepting states (Language L(M) = ∅).');
    }

    // Check determinism: Exactly 1 transition per (state, symbol)
    for (const state of this.model.states) {
      for (const sym of this.model.alphabet) {
        const trans = this.model.transitions.filter(
          (t) => t.fromStateId === state.id && t.symbol === sym
        );
        if (trans.length === 0) {
          warnings.push(`State '${state.name}' has missing transition for symbol '${sym}'.`);
        } else if (trans.length > 1) {
          errors.push(`Nondeterministic error: State '${state.name}' has multiple transitions for symbol '${sym}'.`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  reset(inputString: string): DFASimulationStep {
    if (!this.model) throw new Error('DFA model not loaded.');
    const startState = this.model.states.find((s) => s.id === this.model!.startStateId || s.isStart);
    if (!startState) throw new Error('DFA has no valid start state.');

    this.currentStateId = startState.id;
    this.currentStepIndex = 0;
    this.remainingInput = inputString === 'ε' ? '' : inputString;
    this.history = [];
    this.isTerminated = false;

    const initialStep: DFASimulationStep = {
      stepIndex: 0,
      currentStateId: startState.id,
      currentStateName: startState.name,
      readSymbol: null,
      remainingInput: this.remainingInput,
      transitionTakenId: null,
      isAccepted: this.remainingInput.length === 0 ? startState.isAccepting : null,
      explanation: `Initialized at start state '${startState.name}'.`,
    };

    this.history.push(initialStep);
    return initialStep;
  }

  step(): DFASimulationStep {
    if (!this.model) throw new Error('DFA model not loaded.');
    if (this.history.length === 0) this.reset('');

    const currentState = this.model.states.find((s) => s.id === this.currentStateId);
    if (!currentState || this.isTerminated) {
      return this.history[this.history.length - 1];
    }

    if (this.remainingInput.length === 0) {
      this.isTerminated = true;
      const finalStep: DFASimulationStep = {
        stepIndex: this.currentStepIndex + 1,
        currentStateId: currentState.id,
        currentStateName: currentState.name,
        readSymbol: null,
        remainingInput: '',
        transitionTakenId: null,
        isAccepted: currentState.isAccepting,
        explanation: currentState.isAccepting
          ? `Input fully consumed. State '${currentState.name}' is ACCEPTING -> ACCEPTED.`
          : `Input fully consumed. State '${currentState.name}' is NOT accepting -> REJECTED.`,
      };
      this.history.push(finalStep);
      return finalStep;
    }

    const symbolToRead = this.remainingInput[0];
    const transition = this.model.transitions.find(
      (t) => t.fromStateId === currentState.id && t.symbol === symbolToRead
    );

    if (!transition) {
      this.isTerminated = true;
      const rejectStep: DFASimulationStep = {
        stepIndex: this.currentStepIndex + 1,
        currentStateId: currentState.id,
        currentStateName: currentState.name,
        readSymbol: symbolToRead,
        remainingInput: this.remainingInput,
        transitionTakenId: null,
        isAccepted: false,
        explanation: `No transition defined from '${currentState.name}' on symbol '${symbolToRead}' -> REJECTED.`,
      };
      this.history.push(rejectStep);
      return rejectStep;
    }

    const targetState = this.model.states.find((s) => s.id === transition.toStateId);
    if (!targetState) throw new Error(`Target state ${transition.toStateId} not found.`);

    this.currentStateId = targetState.id;
    this.remainingInput = this.remainingInput.substring(1);
    this.currentStepIndex += 1;

    const isDone = this.remainingInput.length === 0;
    const isAccepted = isDone ? targetState.isAccepting : null;

    const nextStep: DFASimulationStep = {
      stepIndex: this.currentStepIndex,
      currentStateId: targetState.id,
      currentStateName: targetState.name,
      readSymbol: symbolToRead,
      remainingInput: this.remainingInput,
      transitionTakenId: transition.id,
      isAccepted,
      explanation: `Read symbol '${symbolToRead}': Transitioned from '${currentState.name}' -> '${targetState.name}'.`,
    };

    this.history.push(nextStep);
    if (isDone) this.isTerminated = true;

    return nextStep;
  }

  run(): DFASimulationStep[] {
    while (!this.isTerminated) {
      this.step();
    }
    return this.history;
  }

  /**
   * Test whether string w is accepted by this DFA
   */
  evaluateString(str: string): boolean {
    this.reset(str);
    const steps = this.run();
    return steps[steps.length - 1].isAccepted === true;
  }

  /**
   * Find counterexample between student DFA and predicate / expected function
   */
  static findCounterexample(
    studentDFA: DFAModel,
    expectedPredicate: (str: string) => boolean,
    maxLen: number = 5
  ): { counterexample: string; expected: boolean; studentResult: boolean } | null {
    const engine = new DFAEngine();
    engine.loadModel(studentDFA);

    const testStrings = StringOps.generateLexicographicStrings(studentDFA.alphabet, maxLen);

    for (const str of testStrings) {
      const studentResult = engine.evaluateString(str);
      const expectedResult = expectedPredicate(str);

      if (studentResult !== expectedResult) {
        return {
          counterexample: str,
          expected: expectedResult,
          studentResult,
        };
      }
    }

    return null;
  }
}
