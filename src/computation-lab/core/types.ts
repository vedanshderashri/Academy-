export type SymbolChar = string;

export interface Alphabet {
  symbols: SymbolChar[];
}

export interface StringOperationResult {
  operationName: string;
  input: string;
  output: string | string[] | boolean;
  explanation: string;
}

export interface LanguageDefinition {
  id: string;
  name: string;
  alphabet: SymbolChar[];
  explicitStrings?: string[];
  description?: string;
}

// AUTOMATA TYPES
export interface DFAState {
  id: string;
  name: string;
  isStart: boolean;
  isAccepting: boolean;
  x: number;
  y: number;
}

export interface DFATransition {
  id: string;
  fromStateId: string;
  toStateId: string;
  symbol: SymbolChar;
}

export interface DFAModel {
  id: string;
  name: string;
  alphabet: SymbolChar[];
  states: DFAState[];
  transitions: DFATransition[];
  startStateId: string;
}

export interface NFAState {
  id: string;
  name: string;
  isStart: boolean;
  isAccepting: boolean;
  x: number;
  y: number;
}

export interface NFATransition {
  id: string;
  fromStateId: string;
  toStateId: string;
  symbol: SymbolChar; // 'ε' or symbol
}

export interface NFAModel {
  id: string;
  name: string;
  alphabet: SymbolChar[];
  states: NFAState[];
  transitions: NFATransition[];
  startStateId: string;
}

// SIMULATION TYPES
export interface DFASimulationStep {
  stepIndex: number;
  currentStateId: string;
  currentStateName: string;
  readSymbol: SymbolChar | null;
  remainingInput: string;
  transitionTakenId: string | null;
  isAccepted: boolean | null;
  explanation: string;
}

export interface NFASimulationStep {
  stepIndex: number;
  activeStateIds: string[]; // Set of active states
  readSymbol: SymbolChar | null;
  remainingInput: string;
  transitionsTakenIds: string[];
  isAccepted: boolean | null;
  explanation: string;
}

// COMMON ENGINE INTERFACE
export interface ISimulationEngine<TModel, TConfig> {
  loadModel(model: TModel): void;
  reset(inputString: string): TConfig;
  step(): TConfig;
  run(): TConfig[];
  validate(): { valid: boolean; errors: string[]; warnings: string[] };
}
