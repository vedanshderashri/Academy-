export class StringOps {
  /**
   * Get string length |w|
   */
  static length(str: string): number {
    return str === 'ε' || str === '' ? 0 : str.length;
  }

  /**
   * Concatenate two strings w1 and w2
   */
  static concatenate(w1: string, w2: string): string {
    const clean1 = w1 === 'ε' ? '' : w1;
    const clean2 = w2 === 'ε' ? '' : w2;
    const res = clean1 + clean2;
    return res === '' ? 'ε' : res;
  }

  /**
   * String power w^k
   */
  static power(w: string, k: number): string {
    if (k <= 0 || w === 'ε' || w === '') return 'ε';
    let res = '';
    for (let i = 0; i < k; i++) {
      res += w;
    }
    return res;
  }

  /**
   * Reverse string w^R
   */
  static reverse(str: string): string {
    if (str === 'ε' || str === '') return 'ε';
    return str.split('').reverse().join('');
  }

  /**
   * Generate all prefixes of string w
   */
  static getPrefixes(str: string): string[] {
    if (str === 'ε' || str === '') return ['ε'];
    const prefixes = ['ε'];
    for (let i = 1; i <= str.length; i++) {
      prefixes.push(str.substring(0, i));
    }
    return prefixes;
  }

  /**
   * Generate all suffixes of string w
   */
  static getSuffixes(str: string): string[] {
    if (str === 'ε' || str === '') return ['ε'];
    const suffixes = ['ε'];
    for (let i = 0; i < str.length; i++) {
      suffixes.push(str.substring(i));
    }
    return Array.from(new Set(suffixes));
  }

  /**
   * Generate all substrings of string w
   */
  static getSubstrings(str: string): string[] {
    if (str === 'ε' || str === '') return ['ε'];
    const set = new Set<string>(['ε']);
    for (let i = 0; i < str.length; i++) {
      for (let j = i + 1; j <= str.length; j++) {
        set.add(str.substring(i, j));
      }
    }
    return Array.from(set);
  }

  /**
   * Check if sub is a subsequence of str
   */
  static isSubsequence(sub: string, str: string): boolean {
    if (sub === 'ε' || sub === '') return true;
    let i = 0;
    let j = 0;
    while (i < sub.length && j < str.length) {
      if (sub[i] === str[j]) i++;
      j++;
    }
    return i === sub.length;
  }

  /**
   * Lexicographic sort for strings over alphabet
   */
  static lexicographicCompare(a: string, b: string): number {
    if (a.length !== b.length) return a.length - b.length;
    return a.localeCompare(b);
  }

  /**
   * Generate strings up to length n in lexicographic order
   */
  static generateLexicographicStrings(alphabet: string[], maxLen: number): string[] {
    const result: string[] = ['ε'];
    let currentLevel: string[] = [''];

    for (let len = 1; len <= maxLen; len++) {
      const nextLevel: string[] = [];
      for (const prefix of currentLevel) {
        for (const sym of alphabet) {
          const newStr = prefix + sym;
          nextLevel.push(newStr);
          result.push(newStr);
        }
      }
      currentLevel = nextLevel;
    }

    return result;
  }
}
