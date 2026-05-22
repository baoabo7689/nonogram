import { NonogramGridModel } from '@/models/NonogramGridModel';
import { initRowColInfo } from '@/utilities/solutions/_1_initRowColInfo';
import { applyTrimLines } from '@/utilities/solutions/_2_applyTrimLines';
import { applySimpleCrossesMethod } from '@/utilities/solutions/_3_applySimpleCrossesMethod';
import { applyMaxLengthMethod } from '@/utilities/solutions/_4_applyMaxLengthMethod';
import { applyOverlappingMethod } from '@/utilities/solutions/_5_applyOverlappingMethod';
import { applySpreadingMethod } from '@/utilities/solutions/_6_applySpreadingMethod';

export interface SolveResult {
  solved: boolean;
  model: NonogramGridModel;
  message: string;
}

export function solveNonogram(model: NonogramGridModel): SolveResult {
  const initializedModel = initRowColInfo(model);
  const trimmed = applyTrimLines(initializedModel);
  const simpleCrossed = applySimpleCrossesMethod(trimmed.model);
  const maxLengthApplied = applyMaxLengthMethod(simpleCrossed.model);
  const overlappingApplied = applyOverlappingMethod(maxLengthApplied.model);
  const spreadingApplied = applySpreadingMethod(overlappingApplied.model);

  return {
    solved: true,
    model: spreadingApplied.model,
    message: '',
  };
}
