// Draw Engine - Handles random and algorithmic draw logic

export interface DrawResult {
  winningNumbers: number[];
  matches: { userId: string; matchCount: number; matchedNumbers: number[] }[];
}

/**
 * Generate random winning numbers (5 unique numbers between 1-45)
 */
export function generateRandomNumbers(): number[] {
  const numbers: Set<number> = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Generate algorithmic winning numbers based on user score frequency
 * Weighted by most/least frequent user scores
 */
export function generateAlgorithmicNumbers(
  allScores: number[]
): number[] {
  if (allScores.length === 0) return generateRandomNumbers();

  // Count frequency of each score
  const frequency: Record<number, number> = {};
  allScores.forEach((score) => {
    frequency[score] = (frequency[score] || 0) + 1;
  });

  // Create weighted pool - less frequent scores have higher weight
  const maxFreq = Math.max(...Object.values(frequency));
  const weightedPool: number[] = [];

  for (let i = 1; i <= 45; i++) {
    const freq = frequency[i] || 0;
    const weight = maxFreq - freq + 1;
    for (let j = 0; j < weight; j++) {
      weightedPool.push(i);
    }
  }

  // Pick 5 unique numbers from weighted pool
  const numbers: Set<number> = new Set();
  while (numbers.size < 5) {
    const idx = Math.floor(Math.random() * weightedPool.length);
    numbers.add(weightedPool[idx]);
  }

  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Compare user numbers against winning numbers
 * Returns the count of matching numbers
 */
export function countMatches(
  userNumbers: number[],
  winningNumbers: number[]
): { count: number; matched: number[] } {
  const winningSet = new Set(winningNumbers);
  const matched = userNumbers.filter((n) => winningSet.has(n));
  return { count: matched.length, matched };
}

/**
 * Calculate prize distribution for a draw
 */
export function calculatePrizeDistribution(
  totalPool: number,
  jackpotRollover: number = 0
) {
  return {
    fiveMatch: totalPool * 0.40 + jackpotRollover,
    fourMatch: totalPool * 0.35,
    threeMatch: totalPool * 0.25,
    total: totalPool + jackpotRollover,
  };
}

/**
 * Determine prize per winner based on match type and number of winners
 */
export function calculatePrizePerWinner(
  poolShare: number,
  winnerCount: number
): number {
  if (winnerCount === 0) return 0;
  return Math.round((poolShare / winnerCount) * 100) / 100;
}

/**
 * Process a full draw - given entries and winning numbers, find all winners
 */
export function processDraw(
  entries: { userId: string; numbers: number[] }[],
  winningNumbers: number[]
): DrawResult {
  const matches = entries
    .map((entry) => {
      const { count, matched } = countMatches(entry.numbers, winningNumbers);
      return {
        userId: entry.userId,
        matchCount: count,
        matchedNumbers: matched,
      };
    })
    .filter((m) => m.matchCount >= 3);

  return { winningNumbers, matches };
}
