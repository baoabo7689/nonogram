import { NonogramGridModel, ClueInfo } from '@/models/NonogramGridModel';

interface ParsedClueHint {
  leadX: number;
  trailX: number;
  trimmedTokens: string[];
}

function splitClueTokens(clueStr: string): string[] {
  return clueStr
    .trim()
    .split(/[\s\n]+/)
    .filter(Boolean);
}

function parseClueHint(clueStr: string): ParsedClueHint {
  const tokens = splitClueTokens(clueStr);
  if (tokens.length === 0) {
    return { leadX: 0, trailX: 0, trimmedTokens: [] };
  }

  let start = 0;
  let end = tokens.length - 1;
  let leadX = 0;
  let trailX = 0;

  const leadMatch = tokens[start]?.match(/^(\d+)X$/i);
  if (leadMatch) {
    leadX = parseInt(leadMatch[1], 10);
    start++;
  }

  if (end >= start) {
    const trailMatch = tokens[end]?.match(/^(\d+)X$/i);
    if (trailMatch) {
      trailX = parseInt(trailMatch[1], 10);
      end--;
    }
  }

  return {
    leadX,
    trailX,
    trimmedTokens: tokens.slice(start, end + 1),
  };
}

/**
 * Parse a clue string into a number array
 * Handles both space-separated (rows) and newline-separated (columns) formats
 * Strips X hints (e.g., "2X 3 4X" → [3])
 */
function parseClueString(clueStr: string): number[] {
  const { trimmedTokens } = parseClueHint(clueStr);
  const numbers: number[] = [];

  for (const token of trimmedTokens) {
    const num = parseInt(token, 10);
    if (!isNaN(num)) {
      numbers.push(num);
    }
  }

  return numbers.length > 0 ? numbers : [0];
}

/**
 * Compute ClueInfo for a given clue string
 * ClueInfo contains trimmedClues and start/end cell range after trimming NX hints
 */
function computeClueInfo(clueStr: string, lineLength: number): ClueInfo {
  const { leadX, trailX } = parseClueHint(clueStr);
  const trimmedClues = parseClueString(clueStr);

  return {
    trimmedClues,
    start: leadX,
    end: lineLength - trailX - 1,
  };
}

function normalizeClueString(clueStr: string, separator: string): string {
  const trimmedClues = parseClueString(clueStr);
  if (trimmedClues.length === 1 && trimmedClues[0] === 0) {
    return '0';
  }
  return trimmedClues.join(separator);
}

/**
 * Initialize rowInfo and colInfo for a NonogramGridModel
 * Trims leading/trailing NX hints, marks the hinted cells as crossed, and computes ranges
 */
export function initRowColInfo(model: NonogramGridModel): NonogramGridModel {
  const cells = model.cells.map((row) => row.map((cell) => ({ ...cell })));
  const rowClues = model.rowClues.map((clue, rowIndex) => {
    const { leadX, trailX } = parseClueHint(clue);
    for (let colIndex = 0; colIndex < leadX && colIndex < model.cols; colIndex++) {
      cells[rowIndex][colIndex].state = 'crossed';
    }
    for (let colIndex = Math.max(model.cols - trailX, 0); colIndex < model.cols; colIndex++) {
      cells[rowIndex][colIndex].state = 'crossed';
    }
    return normalizeClueString(clue, ' ');
  });
  const colClues = model.colClues.map((clue, colIndex) => {
    const { leadX, trailX } = parseClueHint(clue);
    for (let rowIndex = 0; rowIndex < leadX && rowIndex < model.rows; rowIndex++) {
      cells[rowIndex][colIndex].state = 'crossed';
    }
    for (let rowIndex = Math.max(model.rows - trailX, 0); rowIndex < model.rows; rowIndex++) {
      cells[rowIndex][colIndex].state = 'crossed';
    }
    return normalizeClueString(clue, '\n');
  });
  const rowInfo = rowClues.map((clue) => computeClueInfo(clue, model.cols));
  const colInfo = colClues.map((clue) => computeClueInfo(clue, model.rows));

  return {
    ...model,
    cells,
    rowClues,
    colClues,
    rowInfo,
    colInfo,
  };
}

export { parseClueString, computeClueInfo };
