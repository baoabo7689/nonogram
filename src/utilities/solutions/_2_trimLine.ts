import { CellState, ClueInfo } from '@/models/NonogramGridModel';

export interface TrimLineResult {
  line: CellState[];
  clueInfo: ClueInfo;
  changed: boolean;
}

function cloneClueInfo(clueInfo: ClueInfo): ClueInfo {
  return {
    trimmedClues: [...clueInfo.trimmedClues],
    start: clueInfo.start,
    end: clueInfo.end,
  };
}

function hasNoClues(clueInfo: ClueInfo): boolean {
  return clueInfo.trimmedClues.length === 0 || clueInfo.trimmedClues[0] === 0;
}

function normalizeClues(clues: number[]): number[] {
  return clues.length === 0 ? [0] : clues;
}

function trimCrossedEdges(line: CellState[], clueInfo: ClueInfo): boolean {
  let changed = false;

  while (clueInfo.start <= clueInfo.end && line[clueInfo.start] === 'crossed') {
    clueInfo.start++;
    changed = true;
  }

  while (clueInfo.end >= clueInfo.start && line[clueInfo.end] === 'crossed') {
    clueInfo.end--;
    changed = true;
  }

  return changed;
}

function consumeLeftConfirmedGroup(line: CellState[], clueInfo: ClueInfo): boolean {
  if (clueInfo.start > clueInfo.end || hasNoClues(clueInfo)) {
    return false;
  }

  const firstClue = clueInfo.trimmedClues[0];
  if (firstClue <= 0) {
    return false;
  }

  let filledCount = 0;
  while (
    clueInfo.start + filledCount <= clueInfo.end &&
    line[clueInfo.start + filledCount] === 'filled'
  ) {
    filledCount++;
  }

  if (filledCount !== firstClue) {
    return false;
  }

  const nextIndex = clueInfo.start + firstClue;
  if (nextIndex <= clueInfo.end) {
    if (line[nextIndex] === 'filled') {
      return false;
    }
    if (line[nextIndex] !== 'crossed') {
      line[nextIndex] = 'crossed';
    }
    clueInfo.start = nextIndex + 1;
  } else {
    clueInfo.start = nextIndex;
  }

  clueInfo.trimmedClues = normalizeClues(clueInfo.trimmedClues.slice(1));
  return true;
}

function consumeRightConfirmedGroup(line: CellState[], clueInfo: ClueInfo): boolean {
  if (clueInfo.start > clueInfo.end || hasNoClues(clueInfo)) {
    return false;
  }

  const lastClue = clueInfo.trimmedClues[clueInfo.trimmedClues.length - 1];
  if (lastClue <= 0) {
    return false;
  }

  let filledCount = 0;
  while (
    clueInfo.end - filledCount >= clueInfo.start &&
    line[clueInfo.end - filledCount] === 'filled'
  ) {
    filledCount++;
  }

  if (filledCount !== lastClue) {
    return false;
  }

  const prevIndex = clueInfo.end - lastClue;
  if (prevIndex >= clueInfo.start) {
    if (line[prevIndex] === 'filled') {
      return false;
    }
    if (line[prevIndex] !== 'crossed') {
      line[prevIndex] = 'crossed';
    }
    clueInfo.end = prevIndex - 1;
  } else {
    clueInfo.end = prevIndex;
  }

  clueInfo.trimmedClues = normalizeClues(clueInfo.trimmedClues.slice(0, -1));
  return true;
}

export function trimLine(line: CellState[], clueInfo: ClueInfo): TrimLineResult {
  const nextLine = [...line];
  const nextClueInfo = cloneClueInfo(clueInfo);
  let changed = false;
  let progress = true;

  while (progress) {
    progress = false;

    if (trimCrossedEdges(nextLine, nextClueInfo)) {
      changed = true;
      progress = true;
    }

    if (consumeLeftConfirmedGroup(nextLine, nextClueInfo)) {
      changed = true;
      progress = true;
      continue;
    }

    if (consumeRightConfirmedGroup(nextLine, nextClueInfo)) {
      changed = true;
      progress = true;
    }
  }

  if (nextClueInfo.start > nextClueInfo.end) {
    nextClueInfo.trimmedClues = normalizeClues(
      hasNoClues(nextClueInfo) ? [] : nextClueInfo.trimmedClues
    );
  }

  return {
    line: nextLine,
    clueInfo: nextClueInfo,
    changed,
  };
}
