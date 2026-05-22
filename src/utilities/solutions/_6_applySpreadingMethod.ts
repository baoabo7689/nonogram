import { NonogramGridModel } from '@/models/NonogramGridModel';
import { spreadingMethod } from '@/utilities/solutions/_6_spreadingMethod';
import { cloneClueInfo, setRowStates, setColStates } from '@/utilities/solutions/_0_sharedMethods';

export function applySpreadingMethod(model: NonogramGridModel): {
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
      const rowInfo = nextModel.rowInfo[rowIndex];
      const rowCells = nextModel.cells[rowIndex];
      const result = spreadingMethod(rowCells, rowInfo, 'row');
      if (!result.changed) {
        continue;
      }
      setRowStates(nextModel, rowIndex, result.line);
      changedLines++;
      progress = true;
    }

    for (let colIndex = 0; colIndex < nextModel.cols; colIndex++) {
      const colInfo = nextModel.colInfo[colIndex];
      const colCells = nextModel.cells.map((row) => row[colIndex]);
      const result = spreadingMethod(colCells, colInfo, 'col');
      if (!result.changed) {
        continue;
      }
      setColStates(nextModel, colIndex, result.line);
      changedLines++;
      progress = true;
    }
  }

  return { model: nextModel, changedLines };
}
