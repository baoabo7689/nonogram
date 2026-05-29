import { CellState, NonogramGridModel } from '@/models/NonogramGridModel';
import { cloneClueInfo } from '@/utilities/solutions/_0_sharedMethods';

export interface ContradictionsMethodResult {
  model: NonogramGridModel;
  solved: boolean;
}

function isFeasible(line: CellState[], clues: number[], start: number, end: number): boolean {
  if (start > end) return true;

  const effectiveClues = clues.length === 0 || clues[0] === 0 ? [] : clues;

  function check(pos: number, ci: number): boolean {
    while (pos <= end && line[pos] === 'crossed') pos++;

    if (ci === effectiveClues.length) {
      for (let i = pos; i <= end; i++) {
        if (line[i] === 'filled') return false;
      }
      return true;
    }

    if (pos > end) return false;

    const clue = effectiveClues[ci];

    for (let s = pos; s + clue - 1 <= end; s++) {
      if (s > pos && line[s - 1] === 'filled') break;

      let fits = true;
      for (let i = s; i < s + clue; i++) {
        if (line[i] === 'crossed') {
          fits = false;
          break;
        }
      }

      if (!fits) {
        if (line[s] === 'filled') break;
        continue;
      }

      const nextPos = s + clue;
      if (nextPos <= end && line[nextPos] === 'filled') {
        if (line[s] === 'filled') break;
        continue;
      }

      if (check(nextPos + 1, ci + 1)) return true;
      if (line[s] === 'filled') break;
    }

    return false;
  }

  return check(start, 0);
}

export function contradictionsMethod(model: NonogramGridModel): ContradictionsMethodResult {
  const nextModel: NonogramGridModel = {
    ...model,
    cells: model.cells.map((row) => row.map((cell) => ({ ...cell }))),
    rowInfo: model.rowInfo.map(cloneClueInfo),
    colInfo: model.colInfo.map(cloneClueInfo),
  };

  const emptyCells: Array<[number, number]> = [];
  for (let r = 0; r < model.rows; r++) {
    for (let c = 0; c < model.cols; c++) {
      if (model.cells[r][c].state === 'empty') {
        emptyCells.push([r, c]);
      }
    }
  }

  if (emptyCells.length === 0) {
    return { model: nextModel, solved: true };
  }

  let ptr = 0;

  while (ptr >= 0 && ptr < emptyCells.length) {
    const [r, c] = emptyCells[ptr];
    const state = nextModel.cells[r][c].state;

    if (state === 'filled') {
      // Both values exhausted — backtrack
      nextModel.cells[r][c].state = 'empty';
      ptr--;
      continue;
    }

    // Advance: empty → crossed, crossed → filled
    nextModel.cells[r][c].state = state === 'empty' ? 'crossed' : 'filled';

    const rowInfo = nextModel.rowInfo[r];
    const colInfo = nextModel.colInfo[c];

    const rowLine = nextModel.cells[r].map((cell) => cell.state);
    const colLine = nextModel.cells.map((row) => row[c].state);

    const rowOk = isFeasible(rowLine, rowInfo.trimmedClues, rowInfo.start, rowInfo.end);
    const colOk = rowOk && isFeasible(colLine, colInfo.trimmedClues, colInfo.start, colInfo.end);

    if (rowOk && colOk) {
      ptr++;
    }
    // else: stay at ptr; next iteration will try the next value or backtrack
  }

  return { model: nextModel, solved: ptr >= 0 };
}
