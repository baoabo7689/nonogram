import { NonogramGridModel } from '@/models/NonogramGridModel';
import { initRowColInfo } from '@/utilities/solutions/_1_initRowColInfo';
import { applyTrimLines } from '@/utilities/solutions/_2_applyTrimLines';
import { applySimpleCrossesMethod } from '@/utilities/solutions/_3_applySimpleCrossesMethod';
import { applyMaxLengthMethod } from '@/utilities/solutions/_4_applyMaxLengthMethod';
import { applyOverlappingMethod } from '@/utilities/solutions/_5_applyOverlappingMethod';
import { applySpreadingMethod } from '@/utilities/solutions/_6_applySpreadingMethod';
import { applySimpleCrossesMethodExtends } from '@/utilities/solutions/_7_applySimpleCrossesMethodExtends';
import { applySplittingMethod } from '@/utilities/solutions/_8_applySplittingMethod';
import { applyJoiningMethod } from '@/utilities/solutions/_9_applyJoiningMethod';
import { applyKnownGroupMethod } from '@/utilities/solutions/_10_applyKnownGroupMethod';
import { applyRemainMethod } from '@/utilities/solutions/_11_applyRemainMethod';

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
  const simpleCrossesExtendsApplied = applySimpleCrossesMethodExtends(spreadingApplied.model);
  const splittingApplied = applySplittingMethod(simpleCrossesExtendsApplied.model);
  const joiningApplied = applyJoiningMethod(splittingApplied.model);
  const knownGroupApplied = applyKnownGroupMethod(joiningApplied.model);
  const remainApplied = applyRemainMethod(knownGroupApplied.model);

  return {
    solved: true,
    model: remainApplied.model,
    message: '',
  };
}
