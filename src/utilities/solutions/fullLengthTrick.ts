import { CellState, NonogramGridModel } from '@/models/NonogramGridModel';

export interface SolvedCell {
  row: number;
  col: number;
  state: CellState;
}

export interface FullLengthResult {
  model: NonogramGridModel;
  solvedCells: SolvedCell[];
  errors: string[];
  message: string;
}

function parseClueNumbers(clue: string): number[] {
  const parts = clue
    .trim()
    .split(/[\s\n]+/)
    .filter(Boolean);
  let start = 0;
  let end = parts.length - 1;
  if (start <= end && /^\d+X$/i.test(parts[start])) start++;
  if (end >= start && /^\d+X$/i.test(parts[end])) end--;
  const numberParts = parts.slice(start, end + 1);
  if (numberParts.length === 0 || (numberParts.length === 1 && numberParts[0] === '0')) return [];
  return numberParts.map(Number);
}

/**
 * If sum(clues) + (clues.length - 1) === lineLength, the line has exactly one
 * valid placement. Returns the fully-determined cell states, or null if the rule
 * does not apply.
 */
function solveFullLengthLine(clues: number[], lineLength: number): CellState[] | null {
  if (clues.length === 0) return null;
  const minRequired = clues.reduce((a, b) => a + b, 0) + (clues.length - 1);
  if (minRequired !== lineLength) return null;

  const line: CellState[] = [];
  for (let i = 0; i < clues.length; i++) {
    for (let j = 0; j < clues[i]; j++) {
      line.push('filled');
    }
    if (i < clues.length - 1) {
      line.push('crossed');
    }
  }
  return line;
}

/**
 * Applies the full-length rule to every row and column whose clues exactly
 * fill the available length. Returns a new model with those lines filled in.
 * Cells already set are overwritten only by this rule's result.
 */
export function solveFullLength(model: NonogramGridModel): FullLengthResult {
  let cells: CellState[][] = model.cells.map((row) => row.map((cell) => cell.state));
  const solvedCells: SolvedCell[] = [];
  const errors: string[] = [];

  // apply to rows
  for (let r = 0; r < model.rows; r++) {
    const clues = parseClueNumbers(model.rowClues[r]);
    const solved = solveFullLengthLine(clues, model.cols);
    if (solved) {
      const conflicts: string[] = [];

      solved.forEach((state, c) => {
        const current = cells[r][c];
        if (current !== 'empty' && current !== state) {
          conflicts.push(
            `Row ${r + 1} clue "${model.rowClues[r]}": conflict at col ${c + 1} (expected ${state}, found ${current}).`
          );
        }
      });

      if (conflicts.length > 0) {
        errors.push(...conflicts);
        continue;
      }

      solved.forEach((state, c) => {
        if (cells[r][c] !== state) {
          solvedCells.push({ row: r, col: c, state });
        }
        cells[r][c] = state;
      });
    }
  }

  // apply to columns
  for (let c = 0; c < model.cols; c++) {
    const clues = parseClueNumbers(model.colClues[c]);
    const solved = solveFullLengthLine(clues, model.rows);
    if (solved) {
      const conflicts: string[] = [];

      solved.forEach((state, r) => {
        const current = cells[r][c];
        if (current !== 'empty' && current !== state) {
          conflicts.push(
            `Column ${c + 1} clue "${model.colClues[c]}": conflict at row ${r + 1} (expected ${state}, found ${current}).`
          );
        }
      });

      if (conflicts.length > 0) {
        errors.push(...conflicts);
        continue;
      }

      solved.forEach((state, r) => {
        if (cells[r][c] !== state) {
          solvedCells.push({ row: r, col: c, state });
        }
        cells[r][c] = state;
      });
    }
  }

  const messageParts: string[] = [
    `Full-length trick solved ${solvedCells.length} cell${solvedCells.length === 1 ? '' : 's'}.`,
  ];
  if (errors.length > 0) {
    messageParts.push(`Conflicts found: ${errors.length}.`);
    messageParts.push(errors.join('\n'));
  }

  // Convert CellState[][] back to Cell[][]
  const convertedCells = cells.map((row, r) =>
    row.map((state, c) => ({ ...model.cells[r][c], state }))
  );

  return {
    model: { ...model, cells: convertedCells },
    solvedCells,
    errors,
    message: messageParts.join('\n'),
  };
}
