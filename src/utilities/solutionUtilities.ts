import { NonogramGridModel } from '@/models/NonogramGridModel';
import { solveFullLength_Extend } from '@/utilities/solutions/extFullLengthTrick';

export interface SolveResult {
  solved: boolean;
  model: NonogramGridModel;
  message: string;
}

export function solveNonogram(model: NonogramGridModel): SolveResult {
  const result = solveFullLength_Extend(model);

  return {
    solved: result.errors.length === 0,
    model: result.model,
    message: result.message,
  };
}
