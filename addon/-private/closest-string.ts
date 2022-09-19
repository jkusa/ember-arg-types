/* eslint-disable no-inner-declarations */
import { macroCondition, isDevelopingApp } from '@embroider/macros';

type Closest = (str: string, options: string[]) => string | undefined;

export let closest: Closest;

if (macroCondition(isDevelopingApp())) {
  // https://stackoverflow.com/a/36566052
  function editDistance(s1: string, s2: string): number {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i == 0) costs[j] = j;
        else {
          if (j > 0) {
            let newValue = costs[j - 1] as number;
            if (s1.charAt(i - 1) != s2.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j] as number) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length] as number;
  }

  function similar(s1: string, s2: string) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / longerLength;
  }

  closest = (str: string, options: string[]) => {
    let score = 0;
    let index = 0;
    for (let i = 0; i < options.length; i++) {
      const currentScore = similar(str, options[i] as string);
      if (currentScore > score) {
        index = i;
        score = currentScore;
      }
    }
    if (score > 0.4) {
      return options[index];
    }
    return undefined;
  };
} else {
  closest = () => {
    throw new Error('closest() is not available in production');
  };
}
