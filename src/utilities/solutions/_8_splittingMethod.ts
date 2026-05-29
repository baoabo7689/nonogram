import { CellState, ClueInfo } from '@/models/NonogramGridModel';
import { hasNoClues } from '@/utilities/solutions/_0_sharedMethods';

export interface SplittingMethodResult {
  line: CellState[];
  changed: boolean;
}

export function splittingMethod(
  line: CellState[],
  clueInfo: ClueInfo
): SplittingMethodResult {
  const nextLine = [...line];

  if (clueInfo.start > clueInfo.end || hasNoClues(clueInfo)) {
    return { line: nextLine, changed: false };
  }

  const clues = clueInfo.trimmedClues;
  let changed = false;

  for (let i = clueInfo.start; i + 2 <= clueInfo.end; i++) {
    if (nextLine[i] !== 'filled' || nextLine[i + 1] !== 'empty' || nextLine[i + 2] !== 'filled') {
      continue;
    }

    let groupLeft = 0;
    for (let k = i; k >= clueInfo.start && nextLine[k] === 'filled'; k--) {
      groupLeft++;
    }

    let groupRight = 0;
    for (let k = i + 2; k <= clueInfo.end && nextLine[k] === 'filled'; k++) {
      groupRight++;
    }

    const merged = groupLeft + 1 + groupRight;

    if (!clues.some((c) => c >= merged)) {
      nextLine[i + 1] = 'crossed';
      changed = true;
    }
  }

  return { line: nextLine, changed };
}
