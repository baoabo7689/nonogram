import { NonogramGridModel } from '@/models/NonogramGridModel';
import {
  contradictionsMethod,
  ContradictionsMethodResult,
} from '@/utilities/solutions/_12_contradictionsMethod';

export function applyContradictionsMethod(
  model: NonogramGridModel
): ContradictionsMethodResult {
  return contradictionsMethod(model);
}
