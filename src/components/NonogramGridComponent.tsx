'use client';

import { useCallback, useRef } from 'react';
import { CellState, Cell, NonogramGridModel } from '@/models/NonogramGridModel';

interface Props {
  model: NonogramGridModel;
  onChange: (model: NonogramGridModel) => void;
}

const CELL_SIZE = 24; // px

const cellBg: Record<CellState, string> = {
  empty: 'bg-white',
  filled: 'bg-black',
  crossed: 'bg-blue-500',
};

const cellValue: Record<CellState, string> = {
  empty: '',
  filled: 'F',
  crossed: 'X',
};

const valueToState: Record<string, CellState> = {
  '': 'empty',
  f: 'filled',
  F: 'filled',
  x: 'crossed',
  X: 'crossed',
};

export default function NonogramGridComponent({ model, onChange }: Props) {
  const { rows, cols, cells, rowClues, colClues } = model;

  // ── Cell handlers ──────────────────────────────────────────────────────────
  const handleCellChange = useCallback(
    (r: number, c: number, raw: string) => {
      const trimmed = raw.trim();
      const state: CellState = valueToState[trimmed] ?? 'empty';
      const newCells = cells.map((row, ri) =>
        ri === r ? row.map((cell, ci) => (ci === c ? { ...cell, state } : cell)) : row
      );
      onChange({ ...model, cells: newCells });
    },
    [model, cells, onChange]
  );

  // Cycle state on click (empty → filled → crossed → empty)
  const handleCellClick = useCallback(
    (r: number, c: number) => {
      const cycle: CellState[] = ['empty', 'filled', 'crossed'];
      const next = cycle[(cycle.indexOf(cells[r][c].state) + 1) % 3];
      const newCells = cells.map((row, ri) =>
        ri === r ? row.map((cell, ci) => (ci === c ? { ...cell, state: next } : cell)) : row
      );
      onChange({ ...model, cells: newCells });
    },
    [model, cells, onChange]
  );

  // ── Row clue handlers ──────────────────────────────────────────────────────
  const handleRowClueChange = useCallback(
    (r: number, value: string) => {
      const newRowClues = rowClues.map((clue, i) => (i === r ? value : clue));
      onChange({ ...model, rowClues: newRowClues });
    },
    [model, rowClues, onChange]
  );

  // ── Col clue handlers ──────────────────────────────────────────────────────
  const handleColClueChange = useCallback(
    (c: number, value: string) => {
      const newColClues = colClues.map((clue, i) => (i === c ? value : clue));
      onChange({ ...model, colClues: newColClues });
    },
    [model, colClues, onChange]
  );

  // Auto-resize textarea height
  const autoResizeTextarea = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  // Auto-resize input width based on character count
  const autoResizeInput = (el: HTMLInputElement | null) => {
    if (!el) return;
    el.style.width = `${Math.max(el.value.length + 1, 3)}ch`;
  };

  return (
    <div className="overflow-auto">
      <table className="border-collapse" style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr>
            {/* corner */}
            <td />
            {colClues.map((clue, c) => (
              <td key={c} style={{ width: CELL_SIZE, verticalAlign: 'bottom', padding: 1 }}>
                <textarea
                  ref={(el) => autoResizeTextarea(el)}
                  value={clue}
                  rows={1}
                  onChange={(e) => {
                    autoResizeTextarea(e.currentTarget);
                    handleColClueChange(c, e.target.value);
                  }}
                  className={`
                    w-full resize-none overflow-hidden border border-gray-300 rounded
                    text-center text-xs leading-tight p-0.5
                    focus:outline-none focus:ring-1 focus:ring-blue-400
                  `}
                  style={{ minWidth: CELL_SIZE, width: CELL_SIZE }}
                  placeholder="…"
                />
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {cells.map((row, r) => (
            <tr key={r}>
              {/* row clue */}
              <td
                style={{
                  padding: 1,
                  verticalAlign: 'middle',
                  whiteSpace: 'nowrap',
                  textAlign: 'right',
                }}
              >
                <input
                  ref={(el) => autoResizeInput(el)}
                  type="text"
                  value={rowClues[r]}
                  onChange={(e) => {
                    autoResizeInput(e.currentTarget);
                    handleRowClueChange(r, e.target.value);
                  }}
                  className={`
                    ml-auto block border border-gray-300 rounded text-center text-xs p-0.5
                    focus:outline-none focus:ring-1 focus:ring-blue-400
                  `}
                  style={{ minWidth: CELL_SIZE, height: CELL_SIZE }}
                  placeholder="…"
                />
              </td>

              {/* cells */}
              {row.map((cell, c) => (
                <td
                  key={c}
                  style={{
                    padding: 1,
                    verticalAlign: 'middle',
                    whiteSpace: 'nowrap',
                    textAlign: 'right',
                  }}
                >
                  <input
                    type="text"
                    maxLength={1}
                    value={cellValue[cell.state]}
                    onClick={() => handleCellClick(r, c)}
                    onChange={(e) => handleCellChange(r, c, e.target.value)}
                    className={`
                      block p-0.5
                      w-full h-full border border-gray-400 rounded
                      text-center text-xs font-bold cursor-pointer
                      focus:outline-none focus:ring-1 focus:ring-gray-500
                      ${cellBg[cell.state]}
                      ${cell.state === 'filled' ? 'text-white' : cell.state === 'crossed' ? 'text-white' : 'text-gray-800'}
                    `}
                    style={{ width: CELL_SIZE, height: CELL_SIZE }}
                    readOnly={false}
                    aria-label={`cell ${r},${c}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
