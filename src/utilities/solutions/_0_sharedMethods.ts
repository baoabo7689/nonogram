import { CellState, ClueInfo, NonogramGridModel } from '@/models/NonogramGridModel';

export function hasNoClues(clueInfo: ClueInfo): boolean {
  return clueInfo.trimmedClues.length === 0 || clueInfo.trimmedClues[0] === 0;
}

export function cloneClueInfo(info: ClueInfo): ClueInfo {
  return {
    trimmedClues: [...info.trimmedClues],
    start: info.start,
    end: info.end,
  };
}

export function getRowStates(model: NonogramGridModel, rowIndex: number): CellState[] {
  return model.cells[rowIndex].map((cell) => cell.state);
}

export function setRowStates(model: NonogramGridModel, rowIndex: number, line: CellState[]): void {
  for (let colIndex = 0; colIndex < model.cols; colIndex++) {
    model.cells[rowIndex][colIndex].state = line[colIndex];
  }
}

export function getColStates(model: NonogramGridModel, colIndex: number): CellState[] {
  return model.cells.map((row) => row[colIndex].state);
}

export function setColStates(model: NonogramGridModel, colIndex: number, line: CellState[]): void {
  for (let rowIndex = 0; rowIndex < model.rows; rowIndex++) {
    model.cells[rowIndex][colIndex].state = line[rowIndex];
  }
}
