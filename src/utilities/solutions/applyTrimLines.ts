import { CellState, ClueInfo, NonogramGridModel } from '@/models/NonogramGridModel';
import { trimLine } from '@/utilities/solutions/trimLine';

function cloneClueInfo(info: ClueInfo): ClueInfo {
  return {
    trimmedClues: [...info.trimmedClues],
    start: info.start,
    end: info.end,
  };
}

function getRowStates(model: NonogramGridModel, rowIndex: number): CellState[] {
  return model.cells[rowIndex].map((cell) => cell.state);
}

function setRowStates(model: NonogramGridModel, rowIndex: number, line: CellState[]): void {
  for (let colIndex = 0; colIndex < model.cols; colIndex++) {
    model.cells[rowIndex][colIndex].state = line[colIndex];
  }
}

function getColStates(model: NonogramGridModel, colIndex: number): CellState[] {
  return model.cells.map((row) => row[colIndex].state);
}

function setColStates(model: NonogramGridModel, colIndex: number, line: CellState[]): void {
  for (let rowIndex = 0; rowIndex < model.rows; rowIndex++) {
    model.cells[rowIndex][colIndex].state = line[rowIndex];
  }
}

export function applyTrimLines(model: NonogramGridModel): {
  model: NonogramGridModel;
  changedLines: number;
} {
  const nextModel: NonogramGridModel = {
    ...model,
    cells: model.cells.map((row) => row.map((cell) => ({ ...cell }))),
    rowInfo: model.rowInfo.map(cloneClueInfo),
    colInfo: model.colInfo.map(cloneClueInfo),
  };

  let changedLines = 0;
  let progress = true;

  while (progress) {
    progress = false;

    for (let rowIndex = 0; rowIndex < nextModel.rows; rowIndex++) {
      const result = trimLine(getRowStates(nextModel, rowIndex), nextModel.rowInfo[rowIndex]);
      if (!result.changed) {
        continue;
      }
      setRowStates(nextModel, rowIndex, result.line);
      nextModel.rowInfo[rowIndex] = result.clueInfo;
      changedLines++;
      progress = true;
    }

    for (let colIndex = 0; colIndex < nextModel.cols; colIndex++) {
      const result = trimLine(getColStates(nextModel, colIndex), nextModel.colInfo[colIndex]);
      if (!result.changed) {
        continue;
      }
      setColStates(nextModel, colIndex, result.line);
      nextModel.colInfo[colIndex] = result.clueInfo;
      changedLines++;
      progress = true;
    }
  }

  return { model: nextModel, changedLines };
}
