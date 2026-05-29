import { Cell, CellState, ClueInfo } from '@/models/NonogramGridModel';
import { hasNoClues } from '@/utilities/solutions/_0_sharedMethods';

export interface JoiningMethodResult {
  line: CellState[];
  clueIndices: (number | undefined)[] | null; // null when segment count != clue count
  changed: boolean;
}

export type JoiningAxis = 'row' | 'col';

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

export function joiningMethod(
  lineCells: Cell[],
  clueInfo: ClueInfo,
  axis: JoiningAxis
): JoiningMethodResult {
  const nextLine = lineCells.map((c) => c.state);

  if (clueInfo.start > clueInfo.end || hasNoClues(clueInfo)) {
    return { line: nextLine, clueIndices: null, changed: false };
  }

  const segments = collectFilledSegments(nextLine, clueInfo.start, clueInfo.end);

  if (segments.length !== clueInfo.trimmedClues.length) {
    return { line: nextLine, clueIndices: null, changed: false };
  }

  const clueIndices: (number | undefined)[] = lineCells.map((c) =>
    axis === 'row' ? c.rowClueIdx : c.colClueIdx
  );

  let changed = false;

  for (let segIndex = 0; segIndex < segments.length; segIndex++) {
    const { start, end } = segments[segIndex];

    for (let i = start; i <= end; i++) {
      clueIndices[i] = segIndex;
    }

    let firstFilled = -1;
    let lastFilled = -1;
    for (let i = start; i <= end; i++) {
      if (nextLine[i] === 'filled') {
        if (firstFilled === -1) firstFilled = i;
        lastFilled = i;
      }
    }

    for (let i = firstFilled + 1; i < lastFilled; i++) {
      if (nextLine[i] === 'empty') {
        nextLine[i] = 'filled';
        changed = true;
      }
    }
  }

  return { line: nextLine, clueIndices, changed };
}
