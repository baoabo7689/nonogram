import { NonogramGridModel } from '@/models/NonogramGridModel';
import { solveFullLength_Extend } from '@/utilities/solutions/extFullLengthTrick';
import { initRowColInfo } from '@/utilities/solutions/initRowColInfo';
import { applyTrimLines } from '@/utilities/solutions/applyTrimLines';

export interface SolveResult {
  solved: boolean;
  model: NonogramGridModel;
  message: string;
}

export function solveNonogram(model: NonogramGridModel): SolveResult {
  const initializedModel = initRowColInfo(model);
  const trimmed = applyTrimLines(initializedModel);
  const result = solveFullLength_Extend(trimmed.model);
  const message =
    trimmed.changedLines > 0
      ? `Trim pass updated ${trimmed.changedLines} line${trimmed.changedLines === 1 ? '' : 's'}.\n${result.message}`
      : result.message;

  return {
    solved: result.errors.length === 0,
    model: result.model,
    message,
  };
}
