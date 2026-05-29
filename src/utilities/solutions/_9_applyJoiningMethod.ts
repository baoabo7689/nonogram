import { NonogramGridModel } from '@/models/NonogramGridModel';
import { joiningMethod } from '@/utilities/solutions/_9_joiningMethod';
import { cloneClueInfo, setRowStates, setColStates } from '@/utilities/solutions/_0_sharedMethods';

export function applyJoiningMethod(model: NonogramGridModel): {
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
      const result = joiningMethod(nextModel.cells[rowIndex], nextModel.rowInfo[rowIndex], 'row');

      if (result.clueIndices !== null) {
        result.clueIndices.forEach((idx, colIndex) => {
          nextModel.cells[rowIndex][colIndex].rowClueIdx = idx;
        });
      }

      if (!result.changed) {
        continue;
      }
      setRowStates(nextModel, rowIndex, result.line);
      changedLines++;
      progress = true;
    }

    for (let colIndex = 0; colIndex < nextModel.cols; colIndex++) {
      const colCells = nextModel.cells.map((row) => row[colIndex]);
      const result = joiningMethod(colCells, nextModel.colInfo[colIndex], 'col');

      if (result.clueIndices !== null) {
        result.clueIndices.forEach((idx, rowIndex) => {
          nextModel.cells[rowIndex][colIndex].colClueIdx = idx;
        });
      }

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
