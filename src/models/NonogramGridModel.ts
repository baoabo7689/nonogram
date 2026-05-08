export type CellState = 'empty' | 'filled' | 'crossed';

export interface NonogramGridModel {
  rows: number;
  cols: number;
  cells: CellState[][];
  rowClues: string[];
  colClues: string[];
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
