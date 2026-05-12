import { CellState, Cell, NonogramGridModel } from '@/models/NonogramGridModel';
import { initRowColInfo } from '@/utilities/solutions/_1_initRowColInfo';

const cellStateCodeMap: Record<CellState, string> = {
  empty: 'E',
  filled: 'F',
  crossed: 'X',
};

function formatClueGroup(clue: string): string {
  const parts = clue.trim().split(/\s+/).filter(Boolean);
  return `[${(parts.length > 0 ? parts : ['0']).join(' ')}]`;
}

function formatClueLine(clues: string[]): string {
  return `[${clues.map((clue) => formatClueGroup(clue)).join(' ')}]`;
}

function formatGridRow(row: Cell[]): string {
  return `[${row.map((cell) => cellStateCodeMap[cell.state]).join(' ')}]`;
}

function parseClueLine(line: string, separator = ' '): string[] {
  const matches = line.match(/\[[^\[\]]*\]/g) ?? [];
  return matches.map((group) => {
    const content = group.slice(1, -1).trim();
    if (content === '0') return '';
    return separator === ' ' ? content : content.split(/\s+/).join(separator);
  });
}

function parseCellCode(code: string): CellState {
  if (code === 'E') return 'empty';
  if (code === 'F') return 'filled';
  if (code === 'X') return 'crossed';
  throw new Error(`Invalid cell code: ${code}`);
}

function parseGridRow(line: string): CellState[] {
  const trimmed = line.trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    throw new Error(`Invalid grid row format: ${line}`);
  }

  const content = trimmed.slice(1, -1).trim();
  if (!content) {
    return [];
  }

  return content.split(/\s+/).map(parseCellCode);
}

export function exportNonogramGrid(model: NonogramGridModel): string {
  const rowClueLine = formatClueLine(model.rowClues);
  const colClueLine = formatClueLine(model.colClues);
  const gridLines = model.cells.map((row) => formatGridRow(row));

  return [rowClueLine, colClueLine, ...gridLines].join('\n');
}

export function importNonogramGrid(serialized: string): NonogramGridModel {
  const lines = serialized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('Invalid nonogram data: expected at least 2 clue lines.');
  }

  const rowClues = parseClueLine(lines[0]);
  const colClues = parseClueLine(lines[1], '\n');
  const parsedStates = lines.slice(2).map(parseGridRow);

  const rows = parsedStates.length;
  const cols = colClues.length;

  if (rows !== rowClues.length) {
    throw new Error('Invalid nonogram data: row clue count does not match grid height.');
  }

  if (parsedStates.some((row) => row.length !== cols)) {
    throw new Error('Invalid nonogram data: grid row width does not match column clue count.');
  }

  // Convert parsed CellState[][] into Cell[][] with position info
  const cells: Cell[][] = parsedStates.map((row, r) =>
    row.map((state, c) => ({
      state,
      rowPos: c,
      colPos: r,
    }))
  );

  return initRowColInfo({
    rows,
    cols,
    cells,
    rowClues,
    colClues,
    rowInfo: [],
    colInfo: [],
  });
}
