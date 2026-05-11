import { CellState } from '@/models/NonogramGridModel';

export interface Pin {
  pos: number; // cell index in trimmed line
  clueIdx: number; // which clue number this cell is confirmed to belong to
}

/**
 * Simple Crosses Trick
 *
 * Condition: The line has exactly N filled cells and N clues in the clues list.
 * For each pair of adjacent filled cells, if the gap between them is greater than
 * the maximum of their two corresponding clue values, we can determine which clue
 * each filled cell belongs to.
 *
 * Algorithm:
 * - If gap(p_i, p_{i+1}) > max(clue[i], clue[i+1]), then:
 *   - p_i belongs to clue[i]
 *   - p_{i+1} belongs to clue[i+1]
 * - For each pinned clue:
 *   - Mark crosses outside the range [pos - clueSize + 1, pos + clueSize - 1]
 *
 * Returns:
 * - Updated line with crosses marked outside valid clue ranges
 * - Array of pins: cells pinned to specific clues
 */
export function applySimpleCrossTrick(
  line: CellState[],
  clues: number[]
): { line: CellState[]; pins: Pin[] } {
  const result = [...line];
  const pins: Pin[] = [];

  // Find all filled cells
  const filledPositions = line
    .map((cell, i) => (cell === 'filled' ? i : -1))
    .filter((i) => i !== -1);

  // Only proceed if we have exactly as many filled cells as clues
  if (filledPositions.length !== clues.length) {
    return { line: result, pins };
  }

  // Process each pair of adjacent filled cells
  const processedClues = new Set<number>();

  for (let i = 0; i < filledPositions.length - 1; i++) {
    const p_i = filledPositions[i];
    const p_next = filledPositions[i + 1];
    const gap = p_next - p_i - 1;
    const maxClueSize = Math.max(clues[i], clues[i + 1]);

    if (gap > maxClueSize) {
      // We can determine which clues these cells belong to
      if (!processedClues.has(i)) {
        pins.push({ pos: p_i, clueIdx: i });
        processedClues.add(i);

        // Mark crosses outside valid range for clue[i]
        const leftBound = p_i - clues[i] + 1;
        const rightBound = p_i + clues[i] - 1;
        for (let c = 0; c < leftBound; c++) {
          if (result[c] === 'empty') result[c] = 'crossed';
        }
        for (let c = rightBound + 1; c < result.length; c++) {
          if (result[c] === 'empty') result[c] = 'crossed';
        }
      }

      if (!processedClues.has(i + 1)) {
        pins.push({ pos: p_next, clueIdx: i + 1 });
        processedClues.add(i + 1);

        // Mark crosses outside valid range for clue[i+1]
        const leftBound = p_next - clues[i + 1] + 1;
        const rightBound = p_next + clues[i + 1] - 1;
        for (let c = 0; c < leftBound; c++) {
          if (result[c] === 'empty') result[c] = 'crossed';
        }
        for (let c = rightBound + 1; c < result.length; c++) {
          if (result[c] === 'empty') result[c] = 'crossed';
        }
      }
    }
  }

  return { line: result, pins };
}
