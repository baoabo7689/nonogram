import { NonogramGridModel } from '@/models/NonogramGridModel';
import { knownGroupMethod } from '@/utilities/solutions/_10_knownGroupMethod';
import { cloneClueInfo, setRowStates, setColStates } from '@/utilities/solutions/_0_sharedMethods';

export function applyKnownGroupMethod(model: NonogramGridModel): {
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
      const result = knownGroupMethod(
        nextModel.cells[rowIndex],
        nextModel.rowInfo[rowIndex],
        'row'
      );
      if (!result.changed) {
        continue;
      }
      setRowStates(nextModel, rowIndex, result.line);
      changedLines++;
      progress = true;
    }

    for (let colIndex = 0; colIndex < nextModel.cols; colIndex++) {
      const result = knownGroupMethod(
        nextModel.cells.map((row) => row[colIndex]),
        nextModel.colInfo[colIndex],
        'col'
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
