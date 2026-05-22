import { CellState, ClueInfo } from '@/models/NonogramGridModel';
import { hasNoClues } from '@/utilities/solutions/_0_sharedMethods';

export interface OverlappingMethodResult {
  line: CellState[];
  changed: boolean;
}

function getRequiredLength(clues: number[]): number {
  return clues.reduce((sum, clue) => sum + clue, 0) + (clues.length - 1);
}

function getOverlapRange(
  rangeAStart: number,
  rangeAEnd: number,
  rangeBStart: number,
  rangeBEnd: number
): { start: number; end: number } | null {
  const start = Math.max(rangeAStart, rangeBStart);
  const end = Math.min(rangeAEnd, rangeBEnd);
  return start <= end ? { start, end } : null;
}

function fillRange(line: CellState[], from: number, to: number): boolean {
  if (from > to) {
    return false;
  }

  let changed = false;
  for (let index = from; index <= to; index++) {
    if (line[index] === 'empty') {
      line[index] = 'filled';
      changed = true;
    }
  }
  return changed;
}

export function overlappingMethod(line: CellState[], clueInfo: ClueInfo): OverlappingMethodResult {
  const nextLine = [...line];

  if (clueInfo.start > clueInfo.end || hasNoClues(clueInfo)) {
    return { line: nextLine, changed: false };
  }

  const clues = clueInfo.trimmedClues;
  const trimmedLength = clueInfo.end - clueInfo.start + 1;
  const requiredLength = getRequiredLength(clues);

  if (requiredLength > trimmedLength) {
    return { line: nextLine, changed: false };
  }

  let changed = false;
  const spacing = clues.length - 1;
  const totalClueLength = clues.reduce((sum, clue) => sum + clue, 0);

  const firstClue = clues[0];
  const lengthForFirst = trimmedLength - (totalClueLength + spacing - firstClue);
  const firstRangeAStart = 0;
  const firstRangeAEnd = firstClue - 1;
  const firstRangeBStart = lengthForFirst - firstClue;
  const firstRangeBEnd = lengthForFirst - 1;

  const firstOverlapRange = getOverlapRange(
    firstRangeAStart,
    firstRangeAEnd,
    firstRangeBStart,
    firstRangeBEnd
  );

  if (
    firstOverlapRange &&
    fillRange(
      nextLine,
      clueInfo.start + firstOverlapRange.start,
      clueInfo.start + firstOverlapRange.end
    )
  ) {
    changed = true;
  }

  const lastClue = clues[clues.length - 1];
  const lengthForLast = trimmedLength - (totalClueLength + spacing - lastClue);
  const lastRangeAStart = trimmedLength - lastClue;
  const lastRangeAEnd = trimmedLength - 1;
  const lastRangeBEnd = trimmedLength - (lengthForLast - lastClue) - 1;
  const lastRangeBStart = lastRangeBEnd - lastClue + 1;

  const lastOverlapRange = getOverlapRange(
    lastRangeAStart,
    lastRangeAEnd,
    lastRangeBStart,
    lastRangeBEnd
  );

  if (
    lastOverlapRange &&
    fillRange(
      nextLine,
      clueInfo.start + lastOverlapRange.start,
      clueInfo.start + lastOverlapRange.end
    )
  ) {
    changed = true;
  }

  return {
    line: nextLine,
    changed,
  };
}
