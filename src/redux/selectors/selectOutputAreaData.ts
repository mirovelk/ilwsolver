import { createSelector } from '@reduxjs/toolkit';
import { Complex } from '../../util/complex';
import {
  Result,
  selectActiveSheetProjectedResult,
} from '../features/results/resultsSlice';
import { selectXSeedColor } from '../features/xSeedColors/xSeedColorsSlice';
import { XSeed } from '../features/xSeeds/xSeedsSlice';
import { RootState } from '../store';
import { selectActiveSheetXSeeds } from './selectActiveSheetXSeeds';

export const selectActiveSheetOutputAreaData = createSelector(
  [selectActiveSheetXSeeds, (state: RootState) => state], // TODO do properly
  (
    activeSheetXSeeds,
    state
  ): {
    xSeeds: Array<
      Pick<XSeed, 'id' | 'resultsValid'> & {
        color: string;
        results: Array<
          Pick<Result, 'selected' | 'id'> & {
            projectedValues: Complex[];
          }
        >;
      }
    >;
  } => {
    return {
      xSeeds: activeSheetXSeeds.map((xSeed) => ({
        id: xSeed.id,
        color: selectXSeedColor(state, xSeed.id), // TODO do properly
        resultsValid: xSeed.resultsValid,
        results: xSeed.resultIds.map((resultId) => {
          const projectedResult = selectActiveSheetProjectedResult(
            state,
            resultId
          );
          return {
            id: resultId,
            selected: projectedResult.selected,
            projectedValues: projectedResult.values,
          };
        }),
      })),
    };
  }
);
