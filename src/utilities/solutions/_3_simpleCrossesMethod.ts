import { CellState, ClueInfo } from '@/models/NonogramGridModel';
import { hasNoClues } from '@/utilities/solutions/_0_sharedMethods';

export interface SimpleCrossesMethodResult {
  line: CellState[];
  changed: boolean;
}

function collectFilledPositions(line: CellState[], start: number, end: number): number[] {
  const positions: number[] = [];
  for (let index = start; index <= end; index++) {
    if (line[index] === 'filled') {
      positions.push(index);
    }
  }
  return positions;
}

function hasSafeFilledGaps(anchors: number[], clues: number[]): boolean {
  for (let clueIndex = 0; clueIndex < anchors.length - 1; clueIndex++) {
    const distance = anchors[clueIndex + 1] - anchors[clueIndex];
    if (distance <= clues[clueIndex] || distance <= clues[clueIndex + 1]) {
      return false;
    }
  }
  return true;
}

function crossRange(line: CellState[], from: number, to: number): boolean {
  if (from > to) {
    return false;
  }

  let changed = false;
  for (let index = from; index <= to; index++) {
    if (line[index] !== 'empty') {
      continue;
    }
    line[index] = 'crossed';
    changed = true;
  }
  return changed;
}

export function simpleCrossesMethod(
  line: CellState[],
  clueInfo: ClueInfo
): SimpleCrossesMethodResult {
  const nextLine = [...line];

  if (clueInfo.start > clueInfo.end || hasNoClues(clueInfo)) {
    return { line: nextLine, changed: false };
  }

  const clues = clueInfo.trimmedClues;
  const filledPositions = collectFilledPositions(nextLine, clueInfo.start, clueInfo.end);
  if (filledPositions.length !== clues.length) {
    return { line: nextLine, changed: false };
  }

  if (!hasSafeFilledGaps(filledPositions, clues)) {
    return { line: nextLine, changed: false };
  }

  let changed = false;

  for (let clueIndex = 0; clueIndex < clues.length; clueIndex++) {
    const clue = clues[clueIndex];
    const anchor = filledPositions[clueIndex];

    const minCover = anchor - (clue - 1);
    const maxCover = anchor + (clue - 1);

    const leftBound =
      clueIndex === 0
        ? clueInfo.start
        : filledPositions[clueIndex - 1] + (clues[clueIndex - 1] - 1) + 1;
    const rightBound =
      clueIndex === clues.length - 1
        ? clueInfo.end
        : filledPositions[clueIndex + 1] - (clues[clueIndex + 1] - 1) - 1;

    // debugger;
    if (crossRange(nextLine, leftBound, Math.min(minCover - 1, rightBound))) {
      changed = true;
    }

    if (crossRange(nextLine, Math.max(maxCover + 1, leftBound), rightBound)) {
      changed = true;
    }
  }

  return {
    line: nextLine,
    changed,
  };
}
