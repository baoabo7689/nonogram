import { CellState, NonogramGridModel } from '@/models/NonogramGridModel';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** Parse a clue string handling optional leading/trailing NX hints (e.g. "3X 1 1 2X" → leadX=3, numbers=[1,1], trailX=2). */
function parseClueWithHints(clue: string): { leadX: number; numbers: number[]; trailX: number } {
  const parts = clue
    .trim()
    .split(/[\s\n]+/)
    .filter(Boolean);
  if (parts.length === 0) return { leadX: 0, numbers: [], trailX: 0 };

  let startIdx = 0;
  let endIdx = parts.length - 1;
  let leadX = 0;
  let trailX = 0;

  const leadMatch = parts[0].match(/^(\d+)X$/i);
  if (leadMatch) {
    leadX = parseInt(leadMatch[1], 10);
    startIdx = 1;
  }

  // Only parse trailing NX if there's at least one token remaining after lead
  if (endIdx >= startIdx) {
    const trailMatch = parts[endIdx].match(/^(\d+)X$/i);
    if (trailMatch) {
      trailX = parseInt(trailMatch[1], 10);
      endIdx--;
    }
  }

  const numberParts = parts.slice(startIdx, endIdx + 1);
  if (numberParts.length === 0 || (numberParts.length === 1 && numberParts[0] === '0')) {
    return { leadX, numbers: [], trailX };
  }
  return { leadX, numbers: numberParts.map(Number), trailX };
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
 * Validates that all row and column clues can possibly be satisfied within the grid dimensions.
 * Returns a ValidationResult with a boolean and a list of human-readable error messages.
 */
export function validateRules(model: NonogramGridModel): ValidationResult {
  const errors: string[] = [];

  for (let r = 0; r < model.rowClues.length; r++) {
    const { leadX, numbers, trailX } = parseClueWithHints(model.rowClues[r]);
    const minRequired =
      leadX + trailX + numbers.reduce((s, n) => s + n, 0) + Math.max(0, numbers.length - 1);
    if (minRequired > model.cols) {
      errors.push(
        `Row ${r + 1}: clue requires at least ${minRequired} cells but grid has only ${model.cols} column(s)`
      );
    }
  }

  for (let c = 0; c < model.colClues.length; c++) {
    const { leadX, numbers, trailX } = parseClueWithHints(model.colClues[c]);
    const minRequired =
      leadX + trailX + numbers.reduce((s, n) => s + n, 0) + Math.max(0, numbers.length - 1);
    if (minRequired > model.rows) {
      errors.push(
        `Column ${c + 1}: clue requires at least ${minRequired} cells but grid has only ${model.rows} row(s)`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates the current cell state of a NonogramGrid against its row and column clues.
 * Returns a ValidationResult with a boolean and a list of human-readable error messages.
 */
export function validateNonogramGrid(model: NonogramGridModel): ValidationResult {
  const errors: string[] = [];

  for (let r = 0; r < model.rows; r++) {
    const { leadX, numbers, trailX } = parseClueWithHints(model.rowClues[r]);
    for (let i = 0; i < leadX && i < model.cols; i++) {
      if (model.cells[r][i] !== 'crossed')
        errors.push(`Row ${r + 1}: cell ${i + 1} should be crossed (${leadX}X hint)`);
    }
    for (let i = 0; i < trailX && model.cols - 1 - i >= 0; i++) {
      const c = model.cols - 1 - i;
      if (model.cells[r][c] !== 'crossed')
        errors.push(`Row ${r + 1}: cell ${c + 1} should be crossed (trailing ${trailX}X hint)`);
    }
    const middle = model.cells[r].slice(leadX, model.cols - trailX);
    const actual = computeRuns(middle);
    if (!runsMatch(actual, numbers)) {
      errors.push(`Row ${r + 1}: expected [${numbers.join(' ')}], got [${actual.join(' ')}]`);
    }
  }

  for (let c = 0; c < model.cols; c++) {
    const col = model.cells.map((row) => row[c]);
    const { leadX, numbers, trailX } = parseClueWithHints(model.colClues[c]);
    for (let i = 0; i < leadX && i < model.rows; i++) {
      if (col[i] !== 'crossed')
        errors.push(`Column ${c + 1}: cell ${i + 1} should be crossed (${leadX}X hint)`);
    }
    for (let i = 0; i < trailX && model.rows - 1 - i >= 0; i++) {
      const r = model.rows - 1 - i;
      if (col[r] !== 'crossed')
        errors.push(`Column ${c + 1}: cell ${r + 1} should be crossed (trailing ${trailX}X hint)`);
    }
    const middle = col.slice(leadX, model.rows - trailX);
    const actual = computeRuns(middle);
    if (!runsMatch(actual, numbers)) {
      errors.push(`Column ${c + 1}: expected [${numbers.join(' ')}], got [${actual.join(' ')}]`);
    }
  }

  return { valid: errors.length === 0, errors };
}
