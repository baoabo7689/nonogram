import { CellState, ClueInfo } from '@/models/NonogramGridModel';
import { hasNoClues } from '@/utilities/solutions/_0_sharedMethods';

export interface RemainMethodResult {
  line: CellState[];
  changed: boolean;
}

function collectFilledBlockLengths(line: CellState[], start: number, end: number): number[] {
  const lengths: number[] = [];
  let i = start;

  while (i <= end) {
    if (line[i] === 'filled') {
      let count = 0;
      while (i <= end && line[i] === 'filled') {
        count++;
        i++;
      }
      lengths.push(count);
    } else {
      i++;
    }
  }

  return lengths;
}

export function remainMethod(line: CellState[], clueInfo: ClueInfo): RemainMethodResult {
  const nextLine = [...line];

  if (clueInfo.start > clueInfo.end || hasNoClues(clueInfo)) {
    return { line: nextLine, changed: false };
  }

  const clues = clueInfo.trimmedClues;
  const blockLengths = collectFilledBlockLengths(nextLine, clueInfo.start, clueInfo.end);

  if (
    blockLengths.length !== clues.length ||
    !blockLengths.every((len, i) => len === clues[i])
  ) {
    return { line: nextLine, changed: false };
  }

  let changed = false;
  for (let i = clueInfo.start; i <= clueInfo.end; i++) {
    if (nextLine[i] === 'empty') {
      nextLine[i] = 'crossed';
      changed = true;
    }
  }

  return { line: nextLine, changed };
}
