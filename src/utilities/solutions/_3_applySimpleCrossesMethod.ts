import { NonogramGridModel } from '@/models/NonogramGridModel';
import { simpleCrossesMethod } from '@/utilities/solutions/_3_simpleCrossesMethod';
import {
  cloneClueInfo,
  getRowStates,
  setRowStates,
  getColStates,
  setColStates,
} from '@/utilities/solutions/_0_sharedMethods';

export function applySimpleCrossesMethod(model: NonogramGridModel): {
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
      const result = simpleCrossesMethod(
        getRowStates(nextModel, rowIndex),
        nextModel.rowInfo[rowIndex]
      );
      if (!result.changed) {
        continue;
      }
      setRowStates(nextModel, rowIndex, result.line);
      changedLines++;
      progress = true;
    }

    for (let colIndex = 0; colIndex < nextModel.cols; colIndex++) {
      const result = simpleCrossesMethod(
        getColStates(nextModel, colIndex),
        nextModel.colInfo[colIndex]
      );
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
