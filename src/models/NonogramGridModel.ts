export type CellState = 'empty' | 'filled' | 'crossed';

export interface NonogramGridModel {
  rows: number;
  cols: number;
  cells: CellState[][];
  rowClues: string[];
  colClues: string[];
}

function computeClueString(line: boolean[], separator = ' '): string {
  const runs: number[] = [];
  let count = 0;
  for (const cell of line) {
    if (cell) {
      count++;
    } else if (count > 0) {
      runs.push(count);
      count = 0;
    }
  }
  if (count > 0) runs.push(count);
  return runs.length > 0 ? runs.join(separator) : '0';
}

export function createRandomNonogramGrid(
  rows: number,
  cols: number,
  density = 0.5
): NonogramGridModel {
  const filled: boolean[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() < density)
  );
  const cells: CellState[][] = filled.map((row) => row.map((v) => (v ? 'filled' : 'empty')));
  const rowClues = filled.map((row) => computeClueString(row));
  const colClues = Array.from({ length: cols }, (_, c) =>
    computeClueString(
      filled.map((row) => row[c]),
      '\n'
    )
  );
  return { rows, cols, cells, rowClues, colClues };
}

export function createEmptyNonogramGrid(rows: number, cols: number): NonogramGridModel {
  return {
    rows,
    cols,
    cells: Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => 'empty' as CellState)
    ),
    rowClues: Array.from({ length: rows }, () => ''),
    colClues: Array.from({ length: cols }, () => ''),
  };
}
