export type CellState = 'empty' | 'filled' | 'crossed';

export interface Cell {
  state: CellState;
  rowPos: number; // position in the row (0 to cols-1)
  colPos: number; // position in the column (0 to rows-1)
  rowClueIdx?: number; // which row clue index this cell belongs to (undefined if not yet determined)
  colClueIdx?: number; // which column clue index this cell belongs to (undefined if not yet determined)
}

export interface ClueInfo {
  trimmedClues: number[]; // parsed clues after trimming, to prevent duplicate parses
  start: number; // start position after trim
  end: number; // end position after trim
}

export interface NonogramGridModel {
  rows: number;
  cols: number;
  cells: Cell[][];
  rowClues: string[];
  colClues: string[];
  rowInfo: ClueInfo[];
  colInfo: ClueInfo[];
}

function computeClueString(line: boolean[], separator = ' ', withHints = false): string {
  let leadX = 0;
  let startIdx = 0;
  let trailX = 0;
  let endIdx = line.length - 1;
  if (withHints) {
    while (startIdx <= endIdx && !line[startIdx]) {
      leadX++;
      startIdx++;
    }
    while (endIdx >= startIdx && !line[endIdx]) {
      trailX++;
      endIdx--;
    }
  }
  const relevantLine = line.slice(startIdx, endIdx + 1);
  const runs: number[] = [];
  let count = 0;
  for (const cell of relevantLine) {
    if (cell) {
      count++;
    } else if (count > 0) {
      runs.push(count);
      count = 0;
    }
  }
  if (count > 0) runs.push(count);

  if (withHints && (leadX > 0 || trailX > 0)) {
    const middle = runs.length > 0 ? runs.join(separator) : '0';
    const parts: string[] = [];
    if (leadX > 0) parts.push(`${leadX}X`);
    if (runs.length > 0) parts.push(...runs.map(String));
    else if (leadX === 0 || trailX > 0) parts.push('0');
    if (trailX > 0) parts.push(`${trailX}X`);
    return parts.join(separator);
  }
  return runs.length > 0 ? runs.join(separator) : '0';
}

function getLeadX(clue: string): number {
  const firstToken = clue.trim().split(/[\s\n]+/)[0] ?? '';
  const m = firstToken.match(/^(\d+)X$/i);
  return m ? parseInt(m[1], 10) : 0;
}

function getTrailX(clue: string): number {
  const tokens = clue
    .trim()
    .split(/[\s\n]+/)
    .filter(Boolean);
  const lastToken = tokens[tokens.length - 1] ?? '';
  // Only treat as trailing X if it's not also the only/first token
  if (tokens.length < 2) return 0;
  const m = lastToken.match(/^(\d+)X$/i);
  return m ? parseInt(m[1], 10) : 0;
}

export function createRandomNonogramGrid(
  rows: number,
  cols: number,
  density = 0.5
): NonogramGridModel {
  const filled: boolean[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() < density)
  );
  const rowClues = filled.map((row) => computeClueString(row, ' ', true));
  const colClues = Array.from({ length: cols }, (_, c) =>
    computeClueString(
      filled.map((row) => row[c]),
      '\n',
      true
    )
  );

  // Build starting grid: pre-mark hinted crossed cells, rest empty
  const cells: Cell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      state: 'empty' as CellState,
      rowPos: c,
      colPos: r,
    }))
  );

  for (let r = 0; r < rows; r++) {
    const lx = getLeadX(rowClues[r]);
    for (let c = 0; c < lx; c++) cells[r][c].state = 'crossed';
    const tx = getTrailX(rowClues[r]);
    for (let c = cols - tx; c < cols; c++) cells[r][c].state = 'crossed';
  }
  for (let c = 0; c < cols; c++) {
    const lx = getLeadX(colClues[c]);
    for (let r = 0; r < lx; r++) cells[r][c].state = 'crossed';
    const tx = getTrailX(colClues[c]);
    for (let r = rows - tx; r < rows; r++) cells[r][c].state = 'crossed';
  }

  return { rows, cols, cells, rowClues, colClues, rowInfo: [], colInfo: [] };
}

export function clearNonogramGrid(model: NonogramGridModel): NonogramGridModel {
  return {
    ...model,
    cells: Array.from({ length: model.rows }, (_, r) =>
      Array.from({ length: model.cols }, (_, c) => ({
        state: 'empty' as CellState,
        rowPos: c,
        colPos: r,
      }))
    ),
  };
}

export function createEmptyNonogramGrid(rows: number, cols: number): NonogramGridModel {
  return {
    rows,
    cols,
    cells: Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({
        state: 'empty' as CellState,
        rowPos: c,
        colPos: r,
      }))
    ),
    rowClues: Array.from({ length: rows }, () => ''),
    colClues: Array.from({ length: cols }, () => ''),
    rowInfo: [],
    colInfo: [],
  };
}
