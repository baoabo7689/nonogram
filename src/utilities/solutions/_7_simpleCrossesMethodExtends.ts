import { CellState, ClueInfo } from '@/models/NonogramGridModel';
import { hasNoClues } from '@/utilities/solutions/_0_sharedMethods';
import { SimpleCrossesMethodResult } from '@/utilities/solutions/_3_simpleCrossesMethod';

interface FilledBlock {
  left: number;
  right: number;
  count: number;
}

function collectFilledBlocks(line: CellState[], start: number, end: number): FilledBlock[] {
  const blocks: FilledBlock[] = [];
  let i = start;
  while (i <= end) {
    if (line[i] === 'filled') {
      const left = i;
      while (i <= end && line[i] === 'filled') i++;
      blocks.push({ left, right: i - 1, count: i - left });
    } else {
      i++;
    }
  }
  return blocks;
}

function hasSafeBlockGaps(blocks: FilledBlock[], clues: number[]): boolean {
  for (let i = 0; i < blocks.length - 1; i++) {
    const gap = blocks[i + 1].left - blocks[i].right - 1;
    if (gap <= clues[i] - blocks[i].count || gap <= clues[i + 1] - blocks[i + 1].count) {
      return false;
    }
  }
  return true;
}

function crossRange(line: CellState[], from: number, to: number): boolean {
  if (from > to) {
    return false;
  }

  let changed = false;
  for (let index = from; index <= to; index++) {
    if (line[index] !== 'empty') {
      continue;
    }
    line[index] = 'crossed';
    changed = true;
  }
  return changed;
}

export function simpleCrossesMethodExtends(
  line: CellState[],
  clueInfo: ClueInfo
): SimpleCrossesMethodResult {
  const nextLine = [...line];

  if (clueInfo.start > clueInfo.end || hasNoClues(clueInfo)) {
    return { line: nextLine, changed: false };
  }

  const clues = clueInfo.trimmedClues;
  const blocks = collectFilledBlocks(nextLine, clueInfo.start, clueInfo.end);

  if (blocks.length === 0 || blocks.length !== clues.length) {
    return { line: nextLine, changed: false };
  }

  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].count > clues[i]) {
      return { line: nextLine, changed: false };
    }
  }

  if (!hasSafeBlockGaps(blocks, clues)) {
    return { line: nextLine, changed: false };
  }

  let changed = false;

  for (let clueIndex = 0; clueIndex < clues.length; clueIndex++) {
    const clue = clues[clueIndex];
    const { left, right, count } = blocks[clueIndex];

    // Clue block must cover all [left, right] filled cells.
    // It can start as early as left+count-clue (shifted maximally left)
    // and end as late as right+clue-count (shifted maximally right).
    const minCover = left + count - clue;
    const maxCover = right + clue - count;

    const leftBound =
      clueIndex === 0
        ? clueInfo.start
        : blocks[clueIndex - 1].left + clues[clueIndex - 1];

    const rightBound =
      clueIndex === clues.length - 1
        ? clueInfo.end
        : blocks[clueIndex + 1].right - clues[clueIndex + 1];

    if (crossRange(nextLine, leftBound, Math.min(minCover - 1, rightBound))) {
      changed = true;
    }

    if (crossRange(nextLine, Math.max(maxCover + 1, leftBound), rightBound)) {
      changed = true;
    }
  }

  return { line: nextLine, changed };
}
