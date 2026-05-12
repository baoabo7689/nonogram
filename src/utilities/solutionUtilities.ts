import { NonogramGridModel } from '@/models/NonogramGridModel';
import { initRowColInfo } from '@/utilities/solutions/_1_initRowColInfo';
import { applyTrimLines } from '@/utilities/solutions/_2_applyTrimLines';

export interface SolveResult {
  solved: boolean;
  model: NonogramGridModel;
  message: string;
}

export function solveNonogram(model: NonogramGridModel): SolveResult {
  const initializedModel = initRowColInfo(model);
  const trimmed = applyTrimLines(initializedModel);

  return {
    solved: true,
    model: trimmed.model,
    message: '',
  };
}
