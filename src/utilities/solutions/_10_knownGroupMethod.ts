import { Cell, CellState, ClueInfo } from '@/models/NonogramGridModel';
import { hasNoClues } from '@/utilities/solutions/_0_sharedMethods';

export interface KnownGroupMethodResult {
  line: CellState[];
  changed: boolean;
}

export type KnownGroupAxis = 'row' | 'col';

interface FilledSegment {
  start: number;
  end: number;
}

function collectFilledSegments(line: CellState[], start: number, end: number): FilledSegment[] {
  const segments: FilledSegment[] = [];
  let i = start;

  while (i <= end) {
    if (line[i] === 'crossed') {
      i++;
      continue;
    }

    const segStart = i;
    let hasFilled = false;
    while (i <= end && line[i] !== 'crossed') {
      if (line[i] === 'filled') hasFilled = true;
      i++;
    }

    if (hasFilled) {
      segments.push({ start: segStart, end: i - 1 });
    }
  }

  return segments;
}

function crossRange(line: CellState[], from: number, to: number): boolean {
  if (from > to) return false;
  let changed = false;
  for (let i = from; i <= to; i++) {
    if (line[i] === 'empty') {
      line[i] = 'crossed';
      changed = true;
    }
  }
  return changed;
}

function fillRange(line: CellState[], from: number, to: number): boolean {
  if (from > to) return false;
  let changed = false;
  for (let i = from; i <= to; i++) {
    if (line[i] === 'empty') {
      line[i] = 'filled';
      changed = true;
    }
  }
  return changed;
}

export function knownGroupMethod(
  lineCells: Cell[],
  clueInfo: ClueInfo,
  axis: KnownGroupAxis
): KnownGroupMethodResult {
  const nextLine = lineCells.map((c) => c.state);

  if (clueInfo.start > clueInfo.end || hasNoClues(clueInfo)) {
    return { line: nextLine, changed: false };
  }

  const clues = clueInfo.trimmedClues;
  const segments = collectFilledSegments(nextLine, clueInfo.start, clueInfo.end);
  let changed = false;

  for (const { start: segStart, end: segEnd } of segments) {
    let firstFilled = -1;
    let lastFilled = -1;
    let clueIdx: number | undefined;

    for (let i = segStart; i <= segEnd; i++) {
      if (nextLine[i] === 'filled') {
        if (firstFilled === -1) firstFilled = i;
        lastFilled = i;
        if (clueIdx === undefined) {
          clueIdx = axis === 'row' ? lineCells[i].rowClueIdx : lineCells[i].colClueIdx;
        }
      }
    }

    if (clueIdx === undefined) continue;

    const clue = clues[clueIdx];
    const blockLen = lastFilled - firstFilled + 1;

    if (blockLen > clue) continue;

    const remaining = clue - blockLen;

    // Cross cells outside the possible range of this clue block
    if (crossRange(nextLine, segStart, firstFilled - remaining - 1)) changed = true;
    if (crossRange(nextLine, lastFilled + remaining + 1, segEnd)) changed = true;

    // Spread if block touches the segment boundary on the left
    if (firstFilled === segStart) {
      if (fillRange(nextLine, firstFilled, Math.min(lastFilled + remaining, segEnd))) changed = true;
    }

    // Spread if block touches the segment boundary on the right
    if (lastFilled === segEnd) {
      if (fillRange(nextLine, Math.max(firstFilled - remaining, segStart), lastFilled)) changed = true;
    }
  }

  return { line: nextLine, changed };
}
