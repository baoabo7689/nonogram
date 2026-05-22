import { Cell, CellState, ClueInfo } from '@/models/NonogramGridModel';
import { hasNoClues } from '@/utilities/solutions/_0_sharedMethods';

export interface SpreadingMethodResult {
  line: CellState[];
  changed: boolean;
}

export type SpreadingAxis = 'row' | 'col';

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

function getCellClueIdx(cell: Cell, axis: SpreadingAxis): number | undefined {
  return axis === 'row' ? cell.rowClueIdx : cell.colClueIdx;
}

function findFirstFilledForFirstClue(
  lineCells: Cell[],
  axis: SpreadingAxis,
  start: number,
  end: number,
  firstClue: number,
  firstClueIdx: number
): number {
  for (let index = start; index <= end; index++) {
    const cell = lineCells[index];
    if (cell.state !== 'filled') {
      continue;
    }

    const distanceFromLeft = index - start;
    if (distanceFromLeft <= firstClue || getCellClueIdx(cell, axis) === firstClueIdx) {
      return index;
    }
  }

  return -1;
}

function findLastFilledForLastClue(
  lineCells: Cell[],
  axis: SpreadingAxis,
  start: number,
  end: number,
  lastClue: number,
  lastClueIdx: number
): number {
  for (let index = end; index >= start; index--) {
    const cell = lineCells[index];
    if (cell.state !== 'filled') {
      continue;
    }

    const distanceFromRight = end - index;
    if (distanceFromRight <= lastClue || getCellClueIdx(cell, axis) === lastClueIdx) {
      return index;
    }
  }

  return -1;
}

export function spreadingMethod(
  lineCells: Cell[],
  clueInfo: ClueInfo,
  axis: SpreadingAxis
): SpreadingMethodResult {
  const line = lineCells.map((cell) => cell.state);
  const nextLine = [...line];

  if (clueInfo.start > clueInfo.end || hasNoClues(clueInfo)) {
    return { line: nextLine, changed: false };
  }

  const clues = clueInfo.trimmedClues;
  let changed = false;
  const firstClue = clues[0];
  const lastClue = clues[clues.length - 1];
  const firstClueIdx = 0;
  const lastClueIdx = clues.length - 1;

  const firstFilled = findFirstFilledForFirstClue(
    lineCells,
    axis,
    clueInfo.start,
    clueInfo.end,
    firstClue,
    firstClueIdx
  );

  if (firstFilled !== -1) {
    const distanceFromLeft = firstFilled - clueInfo.start;
    const additionalCount = firstClue - distanceFromLeft;

    if (additionalCount > 0) {
      const from = firstFilled + 1;
      const to = Math.min(firstFilled + additionalCount - 1, clueInfo.end);
      if (fillRange(nextLine, from, to)) {
        changed = true;
      }
    }
  }

  const lastFilled = findLastFilledForLastClue(
    lineCells,
    axis,
    clueInfo.start,
    clueInfo.end,
    lastClue,
    lastClueIdx
  );

  if (lastFilled !== -1) {
    const distanceFromRight = clueInfo.end - lastFilled;
    const additionalCount = lastClue - distanceFromRight;

    if (additionalCount > 0) {
      const from = Math.max(lastFilled - additionalCount + 1, clueInfo.start);
      const to = lastFilled - 1;
      if (fillRange(nextLine, from, to)) {
        changed = true;
      }
    }
  }

  return {
    line: nextLine,
    changed,
  };
}
