import { StringOps } from './StringOps';

export class LanguageEngine {
  /**
   * Union L1 ∪ L2
   */
  static union(l1: string[], l2: string[]): string[] {
    const set = new Set<string>([...l1, ...l2]);
    return Array.from(set).sort(StringOps.lexicographicCompare);
  }

  /**
   * Intersection L1 ∩ L2
   */
  static intersection(l1: string[], l2: string[]): string[] {
    const set2 = new Set<string>(l2);
    return l1.filter((str) => set2.has(str)).sort(StringOps.lexicographicCompare);
  }

  /**
   * Set Difference L1 − L2
   */
  static difference(l1: string[], l2: string[]): string[] {
    const set2 = new Set<string>(l2);
    return l1.filter((str) => !set2.has(str)).sort(StringOps.lexicographicCompare);
  }

  /**
   * Language Concatenation L1L2
   */
  static concatenation(l1: string[], l2: string[]): string[] {
    const set = new Set<string>();
    for (const s1 of l1) {
      for (const s2 of l2) {
        set.add(StringOps.concatenate(s1, s2));
      }
    }
    return Array.from(set).sort(StringOps.lexicographicCompare);
  }

  /**
   * Language Reversal L^R
   */
  static reversal(l: string[]): string[] {
    const set = new Set<string>(l.map((str) => StringOps.reverse(str)));
    return Array.from(set).sort(StringOps.lexicographicCompare);
  }

  /**
   * Kleene Star L* (Sampled up to max k iterations)
   */
  static kleeneStar(l: string[], maxK: number = 3): string[] {
    let current: string[] = ['ε'];
    const resultSet = new Set<string>(['ε']);

    for (let k = 1; k <= maxK; k++) {
      current = this.concatenation(current, l);
      current.forEach((str) => resultSet.add(str));
    }

    return Array.from(resultSet).sort(StringOps.lexicographicCompare);
  }

  /**
   * Kleene Plus L+ (Sampled up to max k iterations)
   */
  static kleenePlus(l: string[], maxK: number = 3): string[] {
    let current: string[] = [...l];
    const resultSet = new Set<string>(l);

    for (let k = 2; k <= maxK; k++) {
      current = this.concatenation(current, l);
      current.forEach((str) => resultSet.add(str));
    }

    return Array.from(resultSet).sort(StringOps.lexicographicCompare);
  }

  /**
   * Language Complement L^C relative to Universe Sigma* up to max length
   */
  static complement(l: string[], alphabet: string[], maxLen: number = 3): string[] {
    const universe = StringOps.generateLexicographicStrings(alphabet, maxLen);
    return this.difference(universe, l);
  }
}
