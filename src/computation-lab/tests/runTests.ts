import { StringOps } from '../engine/formal-language/StringOps';
import { LanguageEngine } from '../engine/formal-language/LanguageEngine';
import { DFAEngine } from '../engine/automata/DFAEngine';
import { NFAEngine } from '../engine/automata/NFAEngine';
import { DFAModel, NFAModel } from '../core/types';

export function runComputationLabTests() {
  const testResults: { name: string; success: boolean; details: string }[] = [];

  // Test 1: String Operations
  try {
    const rev = StringOps.reverse('01011');
    const len = StringOps.length('01011');
    const prefixes = StringOps.getPrefixes('010');
    const isOk = rev === '11010' && len === 5 && prefixes.length === 4;
    testResults.push({
      name: 'String Operations (Reverse, Length, Prefixes)',
      success: isOk,
      details: isOk ? 'Passed' : `Expected rev=11010, len=5, got rev=${rev}, len=${len}`,
    });
  } catch (e: any) {
    testResults.push({ name: 'String Operations', success: false, details: e.message });
  }

  // Test 2: Formal Language Set Algebra
  try {
    const l1 = ['0', '01'];
    const l2 = ['01', '11'];
    const union = LanguageEngine.union(l1, l2);
    const inter = LanguageEngine.intersection(l1, l2);
    const isOk = union.length === 3 && inter.length === 1 && inter[0] === '01';
    testResults.push({
      name: 'Language Set Algebra (Union & Intersection)',
      success: isOk,
      details: isOk ? 'Passed' : `Got union=${union.join(',')}, inter=${inter.join(',')}`,
    });
  } catch (e: any) {
    testResults.push({ name: 'Language Set Algebra', success: false, details: e.message });
  }

  // Test 3: DFA Engine Simulation
  try {
    const sampleDFA: DFAModel = {
      id: 'test-dfa',
      name: 'Ends with 1',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', name: 'q0', isStart: true, isAccepting: false, x: 0, y: 0 },
        { id: 'q1', name: 'q1', isStart: false, isAccepting: true, x: 100, y: 0 },
      ],
      transitions: [
        { id: 't1', fromStateId: 'q0', toStateId: 'q0', symbol: '0' },
        { id: 't2', fromStateId: 'q0', toStateId: 'q1', symbol: '1' },
        { id: 't3', fromStateId: 'q1', toStateId: 'q0', symbol: '0' },
        { id: 't4', fromStateId: 'q1', toStateId: 'q1', symbol: '1' },
      ],
      startStateId: 'q0',
    };

    const dfa = new DFAEngine();
    dfa.loadModel(sampleDFA);
    const accept101 = dfa.evaluateString('101');
    const reject100 = dfa.evaluateString('100');

    const isOk = accept101 === true && reject100 === false;
    testResults.push({
      name: 'DFA Engine Evaluation (Ends with 1)',
      success: isOk,
      details: isOk ? 'Passed' : `Got accept101=${accept101}, reject100=${reject100}`,
    });
  } catch (e: any) {
    testResults.push({ name: 'DFA Engine Evaluation', success: false, details: e.message });
  }

  // Test 4: Subset Construction (NFA -> DFA)
  try {
    const sampleNFA: NFAModel = {
      id: 'test-nfa',
      name: 'Contains 01',
      alphabet: ['0', '1', 'ε'],
      states: [
        { id: 'nq0', name: 'q0', isStart: true, isAccepting: false, x: 0, y: 0 },
        { id: 'nq1', name: 'q1', isStart: false, isAccepting: false, x: 100, y: 0 },
        { id: 'nq2', name: 'q2', isStart: false, isAccepting: true, x: 200, y: 0 },
      ],
      transitions: [
        { id: 'nt1', fromStateId: 'nq0', toStateId: 'nq0', symbol: '0' },
        { id: 'nt2', fromStateId: 'nq0', toStateId: 'nq0', symbol: '1' },
        { id: 'nt3', fromStateId: 'nq0', toStateId: 'nq1', symbol: '0' },
        { id: 'nt4', fromStateId: 'nq1', toStateId: 'nq2', symbol: '1' },
      ],
      startStateId: 'nq0',
    };

    const convertedDFA = NFAEngine.convertNFAtoDFA(sampleNFA);
    const isOk = convertedDFA.states.length >= 2 && convertedDFA.startStateId !== undefined;
    testResults.push({
      name: 'NFA to DFA Subset Construction',
      success: isOk,
      details: isOk ? `Generated DFA with ${convertedDFA.states.length} states` : 'Failed subset construction',
    });
  } catch (e: any) {
    testResults.push({ name: 'NFA to DFA Subset Construction', success: false, details: e.message });
  }

  console.log('=== COMPUTATION LAB UNIT TEST RESULTS ===');
  testResults.forEach((t) => console.log(`${t.success ? '✓ PASS' : '✗ FAIL'}: ${t.name} -> ${t.details}`));
  return testResults;
}
