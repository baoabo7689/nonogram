import { CellState, NonogramGridModel } from '@/models/NonogramGridModel';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** Parse a clue string (space- or newline-separated) into an array of numbers. */
function parseClueNumbers(clue: string): number[] {
  const parts = clue.trim().split(/[\s\n]+/).filter(Boolean);
  if (parts.length === 0 || (parts.length === 1 && parts[0] === '0')) return [];
  return parts.map(Number);
}

/** Compute the actual run-length encoding of a line of cells. */
function computeRuns(line: CellState[]): number[] {
  const runs: number[] = [];
  let count = 0;
  for (const cell of line) {
    if (cell === 'filled') {
      count++;
    } else if (count > 0) {
      runs.push(count);
      count = 0;
    }
  }
  if (count > 0) runs.push(count);
  return runs;
}

function runsMatch(actual: number[], expected: number[]): boolean {
  if (actual.length !== expected.length) return false;
  return actual.every((v, i) => v === expected[i]);
}

/**
 * Validates the current cell state of a NonogramGrid against its row and column clues.
 * Returns a ValidationResult with a boolean and a list of human-readable error messages.
 */
export function validateNonogramGrid(model: NonogramGridModel): ValidationResult {
  const errors: string[] = [];

  for (let r = 0; r < model.rows; r++) {
    const expected = parseClueNumbers(model.rowClues[r]);
    const actual = computeRuns(model.cells[r]);
    if (!runsMatch(actual, expected)) {
      errors.push(
        `Row ${r + 1}: expected [${expected.join(' ')}], got [${actual.join(' ')}]`
      );
    }
  }

  for (let c = 0; c < model.cols; c++) {
    const col = model.cells.map((row) => row[c]);
    const expected = parseClueNumbers(model.colClues[c]);
    const actual = computeRuns(col);
    if (!runsMatch(actual, expected)) {
      errors.push(
        `Column ${c + 1}: expected [${expected.join(' ')}], got [${actual.join(' ')}]`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}
