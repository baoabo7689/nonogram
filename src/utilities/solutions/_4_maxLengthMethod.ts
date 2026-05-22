import { CellState, ClueInfo } from '@/models/NonogramGridModel';
import { hasNoClues } from '@/utilities/solutions/_0_sharedMethods';

export interface MaxLengthMethodResult {
  line: CellState[];
  changed: boolean;
}

function getRequiredLength(clues: number[]): number {
  return clues.reduce((sum, clue) => sum + clue, 0) + (clues.length - 1);
}

export function maxLengthMethod(line: CellState[], clueInfo: ClueInfo): MaxLengthMethodResult {
  const nextLine = [...line];

  if (clueInfo.start > clueInfo.end || hasNoClues(clueInfo)) {
    return { line: nextLine, changed: false };
  }

  const clues = clueInfo.trimmedClues;
  const trimmedLength = clueInfo.end - clueInfo.start + 1;
  const requiredLength = getRequiredLength(clues);

  if (requiredLength !== trimmedLength) {
    return { line: nextLine, changed: false };
  }

  let changed = false;
  let cursor = clueInfo.start;

  for (let clueIndex = 0; clueIndex < clues.length; clueIndex++) {
    const clue = clues[clueIndex];

    for (let fillOffset = 0; fillOffset < clue; fillOffset++) {
      const index = cursor + fillOffset;
      if (nextLine[index] === 'empty') {
        nextLine[index] = 'filled';
        changed = true;
      }
    }

    cursor += clue;

    if (clueIndex < clues.length - 1 && nextLine[cursor] === 'empty') {
      nextLine[cursor] = 'crossed';
      changed = true;
    }

    cursor++;
  }

  return {
    line: nextLine,
    changed,
  };
}
