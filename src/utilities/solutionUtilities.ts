import { NonogramGridModel } from '@/models/NonogramGridModel';
import { solveFullLength } from '@/utilities/solutions/fullLengthTrick';

export interface SolveResult {
  solved: boolean;
  model: NonogramGridModel;
  message: string;
}

export function solveNonogram(model: NonogramGridModel): SolveResult {
  const result = solveFullLength(model);

  return {
    solved: result.errors.length === 0,
    model: result.model,
    message: result.message,
  };
}
