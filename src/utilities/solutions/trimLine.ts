import { CellState } from '@/models/NonogramGridModel';

export interface TrimResult {
  trimmedLine: CellState[];
  trimmedClues: number[];
  startOffset: number; // index in original line where trimmed line starts
  endOffset: number; // index in original line where trimmed line ends
}

/**
 * Two-pass trim
 *
 * Pass 1: Trim crossed cells from both ends
 * - Find first index where cell != 'crossed'
 * - Find last index where cell != 'crossed'
 *
 * Pass 2: Trim confirmed filled groups
 * - From left: if cells[start..start+clues[0]-1] are all 'filled'
 *   AND cells[start+clues[0]] == 'crossed' (or out of range)
 *   → advance start by clues[0]+1, remove clues[0] from clues front
 * - From right: symmetric process
 *
 * Returns:
 * - trimmedLine: the sub-range after both passes
 * - trimmedClues: clues with confirmed groups removed
 * - startOffset: index in original line where trimmed line starts
 * - endOffset: index in original line where trimmed line ends
 */
export function trimLine(line: CellState[], clues: number[]): TrimResult {
  if (clues.length === 0) {
    return {
      trimmedLine: line,
      trimmedClues: clues,
      startOffset: 0,
      endOffset: line.length - 1,
    };
  }

  // Pass 1: Trim crossed cells from both ends
  let start = 0;
  let end = line.length - 1;

  while (start <= end && line[start] === 'crossed') {
    start++;
  }
  while (end >= start && line[end] === 'crossed') {
    end--;
  }

  if (start > end) {
    // All crossed
    return {
      trimmedLine: [],
      trimmedClues: clues,
      startOffset: 0,
      endOffset: -1,
    };
  }

  // Pass 2: Trim confirmed filled groups from both ends
  let cluesLeft = [...clues];

  // From left: check if first clue is completely filled and followed by crossed
  while (cluesLeft.length > 0) {
    const firstClueSize = cluesLeft[0];
    if (start + firstClueSize - 1 > end) {
      // Not enough space for this clue
      break;
    }

    // Check if all cells from start to start+firstClueSize-1 are 'filled'
    const allFilled = line.slice(start, start + firstClueSize).every((cell) => cell === 'filled');

    if (!allFilled) {
      break;
    }

    // Check if the cell after the group is 'crossed' or out of range
    const nextCell = start + firstClueSize;
    const isFollowedByCrossOrEnd = nextCell > end || line[nextCell] === 'crossed';

    if (!isFollowedByCrossOrEnd) {
      break;
    }

    // This group is confirmed; trim it
    start = nextCell + 1;
    cluesLeft.shift();
  }

  // From right: check if last clue is completely filled and preceded by crossed
  while (cluesLeft.length > 0) {
    const lastClueSize = cluesLeft[cluesLeft.length - 1];
    if (end - lastClueSize + 1 < start) {
      // Not enough space for this clue
      break;
    }

    // Check if all cells from end-lastClueSize+1 to end are 'filled'
    const allFilled = line
      .slice(end - lastClueSize + 1, end + 1)
      .every((cell) => cell === 'filled');

    if (!allFilled) {
      break;
    }

    // Check if the cell before the group is 'crossed' or out of range
    const prevCell = end - lastClueSize;
    const isPrecededByCrossOrStart = prevCell < start || line[prevCell] === 'crossed';

    if (!isPrecededByCrossOrStart) {
      break;
    }

    // This group is confirmed; trim it
    end = prevCell - 1;
    cluesLeft.pop();
  }

  if (start > end) {
    return {
      trimmedLine: [],
      trimmedClues: cluesLeft,
      startOffset: start,
      endOffset: end,
    };
  }

  return {
    trimmedLine: line.slice(start, end + 1),
    trimmedClues: cluesLeft,
    startOffset: start,
    endOffset: end,
  };
}
